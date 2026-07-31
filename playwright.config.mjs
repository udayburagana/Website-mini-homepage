import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:4174",
    browserName: "chromium",
    channel: "chrome",
    screenshot: "only-on-failure"
  },
  webServer: {
    command: "node tests/server.mjs",
    url: "http://127.0.0.1:4174",
    reuseExistingServer: true
  }
});
