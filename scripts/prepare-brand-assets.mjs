import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = path.resolve("public/brand");
fs.mkdirSync(root, { recursive: true });

const sources = {
  mark: "public/brand-src/mark.png",
  lockup: "public/brand-src/lockup.png",
  wordmark: "public/brand-src/wordmark.jpg",
};

function isPaper(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max > 228 && min > 205 && max - min < 38;
}

async function knockout(src) {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixels = Buffer.from(data);
  for (let i = 0; i < pixels.length; i += 4) {
    if (isPaper(pixels[i], pixels[i + 1], pixels[i + 2])) {
      pixels[i + 3] = 0;
    }
  }
  return sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim()
    .png();
}

const mark = await knockout(sources.mark);
await mark.clone().toFile(path.join(root, "mark.png"));

const lockup = await knockout(sources.lockup);
await lockup.clone().toFile(path.join(root, "lockup.png"));

const wordmark = await knockout(sources.wordmark);
await wordmark.clone().toFile(path.join(root, "wordmark.png"));

const markBuf = await sharp(path.join(root, "mark.png")).toBuffer();
const side = 512;
const fitted = await sharp(markBuf)
  .resize(Math.round(side * 0.92), Math.round(side * 0.92), {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();
await sharp({
  create: {
    width: side,
    height: side,
    channels: 4,
    background: { r: 245, g: 241, b: 232, alpha: 1 },
  },
})
  .composite([{ input: fitted, gravity: "centre" }])
  .png()
  .toFile(path.join(root, "favicon.png"));

await sharp(path.join(root, "favicon.png")).toFile("src/app/icon.png");

console.log("wrote brand assets");
