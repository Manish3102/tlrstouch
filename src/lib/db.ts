import dns from "dns";
import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
  // eslint-disable-next-line no-var
  var mongoResolvedUri: string | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

function ensureDnsForAtlas() {
  try {
    dns.setDefaultResultOrder("ipv4first");
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {
    // ignore
  }
}

type DnsJson = {
  Answer?: Array<{ data: string; type: number }>;
};

/** Resolve mongodb+srv via Google DNS-over-HTTPS (bypasses broken local SRV DNS). */
async function resolveSrvConnectionString(uri: string): Promise<string> {
  const parsed = new URL(uri.replace("mongodb+srv://", "https://"));
  const host = parsed.hostname;
  const auth =
    parsed.username || parsed.password
      ? `${decodeURIComponent(parsed.username)}:${decodeURIComponent(parsed.password)}@`
      : "";
  const dbPath = parsed.pathname || "/";

  const srvUrl = `https://dns.google/resolve?name=${encodeURIComponent(
    `_mongodb._tcp.${host}`
  )}&type=SRV`;
  const txtUrl = `https://dns.google/resolve?name=${encodeURIComponent(
    host
  )}&type=TXT`;

  const [srvRes, txtRes] = await Promise.all([
    fetch(srvUrl).then((r) => r.json() as Promise<DnsJson>),
    fetch(txtUrl).then((r) => r.json() as Promise<DnsJson>),
  ]);

  const hosts = (srvRes.Answer || [])
    .filter((a) => a.type === 33)
    .map((a) => {
      // "0 0 27017 cluster0-shard-00-00.xxx.mongodb.net."
      const parts = a.data.trim().split(/\s+/);
      const port = parts[parts.length - 2];
      const name = parts[parts.length - 1].replace(/\.$/, "");
      return `${name}:${port}`;
    });

  if (!hosts.length) {
    throw new Error(`Could not resolve MongoDB SRV records for ${host}`);
  }

  const txt = (txtRes.Answer || [])
    .filter((a) => a.type === 16)
    .map((a) => a.data.replace(/^"|"$/g, ""))
    .join("&");

  const search = new URLSearchParams(parsed.search);
  if (txt) {
    for (const part of txt.split("&")) {
      const [k, v] = part.split("=");
      if (k && !search.has(k)) search.set(k, v ?? "");
    }
  }
  if (!search.has("ssl")) search.set("ssl", "true");
  if (!search.has("retryWrites")) search.set("retryWrites", "true");
  if (!search.has("w")) search.set("w", "majority");

  return `mongodb://${auth}${hosts.join(",")}${dbPath}?${search.toString()}`;
}

async function getConnectionUri(uri: string): Promise<string> {
  if (global.mongoResolvedUri) return global.mongoResolvedUri;
  if (!uri.startsWith("mongodb+srv://")) {
    global.mongoResolvedUri = uri;
    return uri;
  }

  ensureDnsForAtlas();

  try {
    // Prefer DoH resolution on Windows where querySrv often fails
    if (process.platform === "win32") {
      const resolved = await resolveSrvConnectionString(uri);
      global.mongoResolvedUri = resolved;
      return resolved;
    }
  } catch (error) {
    console.warn(
      "[db] DoH SRV resolve failed, falling back to native mongodb+srv:",
      error instanceof Error ? error.message : error
    );
  }

  global.mongoResolvedUri = uri;
  return uri;
}

export async function connectDB() {
  const envUri = process.env.MONGODB_URI?.trim();
  if (!envUri) {
    throw new Error(
      "MONGODB_URI is not defined. Add it to .env.local and restart."
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = (async () => {
      const uri = await getConnectionUri(envUri);
      try {
        return await mongoose.connect(uri, {
          bufferCommands: false,
          serverSelectionTimeoutMS: 20000,
        });
      } catch (error) {
        cached.promise = null;
        throw error;
      }
    })();
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
