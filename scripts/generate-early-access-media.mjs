import { chromium } from "playwright";
import ffmpegPath from "ffmpeg-static";
import { mkdir, writeFile, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join, resolve } from "node:path";

const outputDir = resolve("assets/generated/early-access");
await mkdir(outputDir, { recursive: true });

const exec = (args) => new Promise((resolvePromise, reject) => {
  const process = spawn(ffmpegPath, args, { stdio: ["ignore", "ignore", "pipe"] });
  let error = "";
  process.stderr.on("data", (chunk) => { error += chunk; });
  process.on("exit", (code) => code === 0 ? resolvePromise() : reject(new Error(error)));
});

const inspect = (file) => new Promise((resolvePromise) => {
  const process = spawn(ffmpegPath, ["-hide_banner", "-i", file], { stdio: ["ignore", "ignore", "pipe"] });
  let metadata = "";
  process.stderr.on("data", (chunk) => { metadata += chunk; });
  process.on("exit", () => resolvePromise(metadata));
});

async function record(browser, { name, width, height, portrait = false }) {
  const page = await browser.newPage({ viewport: { width: Math.min(width, 1920), height: Math.min(height, 1350) } });
  await page.setContent(`<canvas id="scene" width="${width}" height="${height}"></canvas>`);
  const base64 = await page.evaluate(async ({ width, height, portrait }) => {
    const canvas = document.querySelector("canvas");
    const context = canvas.getContext("2d", { alpha: false });
    const random = (seed) => {
      const value = Math.sin(seed * 999.13) * 43758.5453;
      return value - Math.floor(value);
    };
    const dust = Array.from({ length: portrait ? 165 : 240 }, (_, index) => ({
      x: random(index + 1), y: random(index + 41), size: .45 + random(index + 93) * 1.9,
      phase: random(index + 137) * Math.PI * 2, speed: .2 + random(index + 181) * .5,
    }));
    const frameCount = 192;
    function draw(frameIndex) {
      const cycle = (frameIndex % frameCount) / frameCount;
      const angle = cycle * Math.PI * 2;
      const doorX = width * (portrait ? .51 : .7);
      const doorY = height * (portrait ? .18 : .2);
      const doorW = width * (portrait ? .29 : .16);
      const doorH = height * (portrait ? .43 : .52);
      const horizon = doorY + doorH;
      const breath = .5 + .5 * Math.sin(angle - Math.PI / 2);

      const sky = context.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#020504"); sky.addColorStop(.55, "#07100d"); sky.addColorStop(1, "#050509");
      context.fillStyle = sky; context.fillRect(0, 0, width, height);

      context.save();
      context.globalCompositeOperation = "screen";
      for (let layer = 0; layer < 6; layer += 1) {
        const fogX = doorX + Math.sin(angle + layer * 1.41) * width * (.08 + layer * .015);
        const fogY = height * (.28 + layer * .105);
        const fog = context.createRadialGradient(fogX, fogY, 0, fogX, fogY, width * (.22 + layer * .035));
        const tint = layer % 2 ? "197,166,255" : "130,239,200";
        fog.addColorStop(0, `rgba(${tint},${.018 + breath * .012})`); fog.addColorStop(1, `rgba(${tint},0)`);
        context.fillStyle = fog; context.fillRect(0, 0, width, height);
      }
      context.restore();

      const ground = context.createLinearGradient(0, horizon, 0, height);
      ground.addColorStop(0, "rgba(5,12,10,.2)"); ground.addColorStop(1, "rgba(2,4,4,.98)");
      context.fillStyle = ground; context.fillRect(0, horizon, width, height - horizon);

      // The light beam and its floor glow are live DOM layers (see .cinematic-early__beam), so the door is drawn closed.
      const slab = context.createLinearGradient(doorX - doorW, 0, doorX + doorW, 0);
      slab.addColorStop(0, "#050807"); slab.addColorStop(.48, "#101712"); slab.addColorStop(.52, "#0a0d0b"); slab.addColorStop(1, "#020403");
      context.fillStyle = slab;
      context.fillRect(doorX - doorW, doorY, doorW * 2, doorH);
      context.strokeStyle = "rgba(223,255,239,.19)"; context.lineWidth = Math.max(1, width * .001);
      context.strokeRect(doorX - doorW, doorY, doorW * 2, doorH);

      context.save(); context.globalCompositeOperation = "screen";
      for (const mote of dust) {
        const x = ((mote.x + Math.sin(angle * mote.speed + mote.phase) * .035 + 1) % 1) * width;
        const y = ((mote.y - cycle * .035 * mote.speed + 1) % 1) * height;
        const alpha = .12 + (.5 + .5 * Math.sin(angle + mote.phase)) * .32;
        context.fillStyle = `rgba(222,255,240,${alpha})`; context.beginPath(); context.arc(x, y, mote.size * width / 1440, 0, Math.PI * 2); context.fill();
      }
      context.restore();

      const vignette = context.createRadialGradient(doorX, height * .48, width * .08, width * .5, height * .5, width * .8);
      vignette.addColorStop(.25, "rgba(0,0,0,0)"); vignette.addColorStop(1, "rgba(0,0,0,.74)");
      context.fillStyle = vignette; context.fillRect(0, 0, width, height);
    }
    draw(frameCount / 2);
    return canvas.toDataURL("image/png", .92).split(",")[1];
  }, { width, height, portrait });
  await page.close();

  const master = join(outputDir, `${name}-master.png`);
  const webm = join(outputDir, `${name}.webm`);
  const mp4 = join(outputDir, `${name}.mp4`);
  const avif = join(outputDir, `${name}-poster.avif`);
  const webp = join(outputDir, `${name}-poster.webp`);
  await writeFile(master, Buffer.from(base64, "base64"));
  const pulse = "eq=brightness='0.018*sin(2*PI*t/8)':contrast='1+0.025*sin(2*PI*t/8)':eval=frame,format=yuv420p";
  await exec(["-y", "-loop", "1", "-framerate", "24", "-i", master, "-t", "8", "-an", "-vf", pulse, "-c:v", "libvpx-vp9", "-crf", portrait ? "43" : "41", "-b:v", "0", "-deadline", "good", "-cpu-used", "3", "-row-mt", "1", webm]);
  await exec(["-y", "-loop", "1", "-framerate", "24", "-i", master, "-t", "8", "-an", "-vf", pulse, "-c:v", "libx264", "-crf", portrait ? "31" : "30", "-preset", "medium", "-movflags", "+faststart", mp4]);
  await exec(["-y", "-i", master, "-frames:v", "1", "-c:v", "libaom-av1", "-still-picture", "1", "-crf", "39", avif]);
  await exec(["-y", "-i", master, "-frames:v", "1", "-c:v", "libwebp", "-quality", "74", webp]);
  const files = [webm, mp4, avif, webp];
  const sizes = Object.fromEntries(await Promise.all(files.map(async (file) => [file.split(/[\\/]/).pop(), (await stat(file)).size])));
  const limits = portrait ? { webm: 900000, mp4: 1300000 } : { webm: 1400000, mp4: 2000000 };
  if (sizes[`${name}.webm`] > limits.webm || sizes[`${name}.mp4`] > limits.mp4 || sizes[`${name}-poster.avif`] > 120000 || sizes[`${name}-poster.webp`] > 120000) {
    throw new Error(`Media budget exceeded: ${JSON.stringify(sizes)}`);
  }
  const [webmMetadata, mp4Metadata] = await Promise.all([inspect(webm), inspect(mp4)]);
  for (const [label, metadata, codec] of [["WebM", webmMetadata, "vp9"], ["MP4", mp4Metadata, "h264"]]) {
    if (!metadata.includes(`Video: ${codec}`) || !metadata.includes(`${width}x${height}`) || !/Duration: 00:00:08\.(0[0-9]|1[0-9])/.test(metadata)) {
      throw new Error(`${label} validation failed for ${name}: ${metadata}`);
    }
  }
  console.log(name, sizes);
}

const browser = await chromium.launch({
  headless: true,
  args: ["--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows"],
});
try {
  await record(browser, { name: "early-access-gateway-desktop", width: 1920, height: 1080 });
  await record(browser, { name: "early-access-gateway-mobile", width: 1080, height: 1350, portrait: true });
} finally {
  await browser.close();
}
