import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 5173);
const root = process.cwd();

const routes = new Map([["/", "Homepage.dc.html"], ["/product", "Product.dc.html"], ["/pricing", "Pricing.dc.html"], ["/about", "About.dc.html"], ["/contact", "Contact.dc.html"], ...["signup", "signin", "demo"].map(name => ["/" + name, name + ".html"])]);

const contentTypes = {
  ".mp4": "video/mp4",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const requestedFile = routes.get(pathname) ?? pathname.slice(1);
  const filePath = normalize(join(root, requestedFile));

  if (!filePath.startsWith(root) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-cache",
  });
  createReadStream(filePath).pipe(response);
}).listen(port, host, () => {
  console.log(`Website running at http://${host}:${port}`);
});
