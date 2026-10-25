import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function safeFolder(folder: string) {
  const cleaned = folder
    .replace(/\\/g, "/")
    .replace(/[^a-z0-9/_-]/gi, "")
    .replace(/\.\./g, "")
    .replace(/^\/+|\/+$/g, "");
  return cleaned || "library";
}

export async function saveLocalImage(
  buffer: Buffer,
  file: { type: string },
  folder: string
) {
  const ext = EXT[file.type] ?? "jpg";
  const relative = path.posix.join("uploads", safeFolder(folder), `${nanoid(12)}.${ext}`);
  const absolute = path.join(process.cwd(), "public", ...relative.split("/"));
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, buffer);
  return {
    url: `/${relative}`,
    publicId: `local/${relative}`,
    width: undefined as number | undefined,
    height: undefined as number | undefined,
    format: ext,
    bytes: buffer.length,
  };
}

export async function deleteLocalUpload(publicId: string) {
  if (!publicId.startsWith("local/uploads/")) return;
  const relative = publicId.slice("local/".length);
  if (relative.includes("..")) return;
  const root = path.resolve(process.cwd(), "public", "uploads");
  const absolute = path.resolve(process.cwd(), "public", ...relative.split("/"));
  const fromRoot = path.relative(root, absolute);
  if (fromRoot.startsWith("..") || path.isAbsolute(fromRoot)) return;
  await unlink(absolute).catch(() => undefined);
}
