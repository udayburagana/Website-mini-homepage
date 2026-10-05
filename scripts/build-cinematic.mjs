import { build } from "esbuild";
import { readFileSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { resolve, join } from "node:path";

const OUTDIR = "vendor";
const FILE_BUDGET_KIB = 250;
const TOTAL_BUDGET_KIB = 320;
const LEGAL_FILE = join(OUTDIR, "cinematic.LEGAL.txt");

// Object form keeps the committed entry filenames that Homepage.dc.html references.
const entryPoints = {
  "visionary-cinematic.bundle": "./visionary-cinematic.js",
  "strategist-cinematic.bundle": "./strategist-cinematic.js",
  "operator-cinematic.bundle": "./operator-cinematic.js",
};

const isCinematicOutput = (file) => /^(chunk-.*\.js|.*-cinematic\.bundle\.js)(\.LEGAL\.txt)?$/.test(file);
readdirSync(OUTDIR).filter(isCinematicOutput).forEach((file) => rmSync(join(OUTDIR, file)));

// Splitting puts code shared by several personas (gsap, ScrollTrigger, Lenis) in one chunk, so the
// page loads one gsap instance and one ticker instead of a copy per persona bundle.
await build({
  entryPoints: Object.fromEntries(Object.entries(entryPoints).map(([name, entry]) => [name, resolve(entry)])),
  bundle: true,
  splitting: true,
  minify: true,
  format: "esm",
  target: "es2020",
  outdir: resolve(OUTDIR),
  chunkNames: "chunk-[hash]",
  legalComments: "external",
  banner: { js: `/*! Third-party licenses: /${LEGAL_FILE.replaceAll("\\", "/")} */` },
});

// esbuild only extracts inline @license comments; append each bundled package's full license text.
const emittedLegal = readdirSync(OUTDIR).filter((file) => file.endsWith(".LEGAL.txt") && isCinematicOutput(file));
const inline = [...new Set(emittedLegal.flatMap((file) => readFileSync(join(OUTDIR, file), "utf8").trim().split(/\n{2,}/)))].join("\n\n");
emittedLegal.forEach((file) => rmSync(join(OUTDIR, file)));
const packages = [
  ["three", "node_modules/three/LICENSE"],
  ["lenis", "node_modules/lenis/LICENSE"],
  ["gsap", "node_modules/gsap/README.md"],
];
const sections = packages.map(([name, file]) => {
  const { version } = JSON.parse(readFileSync(`node_modules/${name}/package.json`, "utf8"));
  const text = readFileSync(file, "utf8");
  const body = name === "gsap" ? text.slice(text.search(/### License/i)).trim() : text.trim();
  return `${name}@${version}\n${"-".repeat(40)}\n${body}`;
});
writeFileSync(LEGAL_FILE, [inline, ...sections].filter(Boolean).join("\n\n\n") + "\n");
// Keep the previously published license path resolving.
writeFileSync(join(OUTDIR, "visionary-cinematic.bundle.js.LEGAL.txt"), `Third-party licenses for the cinematic bundles: /${LEGAL_FILE.replaceAll("\\", "/")}\n`);

let total = 0;
let failed = false;
for (const file of readdirSync(OUTDIR).filter((name) => name.endsWith(".js") && isCinematicOutput(name)).sort()) {
  const kib = gzipSync(readFileSync(join(OUTDIR, file))).length / 1024;
  total += kib;
  console.log(`${OUTDIR}/${file}: ${kib.toFixed(1)} KiB gzip`);
  if (kib >= FILE_BUDGET_KIB) {
    console.error(`${file} exceeds the ${FILE_BUDGET_KIB} KiB gzip budget.`);
    failed = true;
  }
}
console.log(`total: ${total.toFixed(1)} KiB gzip`);
if (total >= TOTAL_BUDGET_KIB) {
  console.error(`Cinematic bundles exceed the ${TOTAL_BUDGET_KIB} KiB gzip total budget.`);
  failed = true;
}
if (failed) process.exit(1);
