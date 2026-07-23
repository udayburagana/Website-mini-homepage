import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const routes = new Map([
  ["/", "/Homepage.dc.html"],
  ["/product", "/Product.dc.html"],
  ["/about", "/About.dc.html"],
  ["/contact", "/Contact.dc.html"]
]);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
};

createServer((request, response) => {
  const pathname = new URL(request.url, "http://127.0.0.1").pathname;
  const routedPath = routes.get(pathname) ?? pathname;
  const safePath = normalize(routedPath).replace(/^([/\\])+/, "");
  const filePath = join(root, safePath);

  if (!filePath.startsWith(root) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream"
  });
  createReadStream(filePath).pipe(response);
}).listen(4174, "127.0.0.1");
