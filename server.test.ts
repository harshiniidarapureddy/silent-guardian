import test from "node:test";
import assert from "node:assert/strict";
import { resolveServerConfig } from "./server";

test("uses CLI --port and --host flags when provided", () => {
  const cfg = resolveServerConfig(
    ["node", "server.ts", "--port", "3000", "--host", "0.0.0.0"],
    { PORT: "8080", NGINX_PORT: "8080", NODE_ENV: "development" }
  );
  assert.equal(cfg.port, 3000);
  assert.equal(cfg.host, "0.0.0.0");
  assert.equal(cfg.hmrEnabled, true);
});

test("supports --port= and --host= equals syntax", () => {
  const cfg = resolveServerConfig(
    ["node", "server.ts", "--port=4100", "--host=127.0.0.1"],
    {}
  );
  assert.equal(cfg.port, 4100);
  assert.equal(cfg.host, "127.0.0.1");
});

test("avoids colliding with NGINX_PORT in development mode", () => {
  const cfg = resolveServerConfig(
    ["node", "server.ts"],
    {
      PORT: "8080",
      NGINX_PORT: "8080",
      DEFAULT_APP_PORT: "3000",
      NODE_ENV: "development",
    }
  );
  assert.equal(cfg.port, 3000);
});

test("uses PORT in production mode even when set to 8080", () => {
  const cfg = resolveServerConfig(
    ["node", "server.ts"],
    {
      PORT: "8080",
      NGINX_PORT: "8080",
      DEFAULT_APP_PORT: "3000",
      NODE_ENV: "production",
    }
  );
  assert.equal(cfg.port, 8080);
});

test("disables HMR when DISABLE_HMR=true", () => {
  const cfg = resolveServerConfig(
    ["node", "server.ts"],
    { DISABLE_HMR: "true" }
  );
  assert.equal(cfg.hmrEnabled, false);
});
