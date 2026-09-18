import assert from "node:assert/strict";
import { test } from "node:test";
import worker from "../site-worker.js";

const env = {
  ASSETS: {
    async fetch() {
      return new Response("ok", { status: 200 });
    },
  },
};

test("www 301s to apex and keeps the path", async () => {
  const res = await worker.fetch(new Request("https://www.aethertab.com/privacy?x=1"), env);
  assert.equal(res.status, 301);
  assert.equal(res.headers.get("location"), "https://aethertab.com/privacy?x=1");
});

test(".html 301s to the pretty URL", async () => {
  const res = await worker.fetch(new Request("https://aethertab.com/privacy.html"), env);
  assert.equal(res.status, 301);
  assert.equal(res.headers.get("location"), "https://aethertab.com/privacy");
});

test("index.html 301s to /", async () => {
  const res = await worker.fetch(new Request("https://aethertab.com/index.html"), env);
  assert.equal(res.status, 301);
  assert.equal(res.headers.get("location"), "https://aethertab.com/");
});

test("www and .html collapse in one hop", async () => {
  const res = await worker.fetch(new Request("https://www.aethertab.com/save-chrome-tabs.html"), env);
  assert.equal(res.status, 301);
  assert.equal(res.headers.get("location"), "https://aethertab.com/save-chrome-tabs");
});

test("pretty URLs pass through to assets", async () => {
  const res = await worker.fetch(new Request("https://aethertab.com/privacy"), env);
  assert.equal(res.status, 200);
  assert.equal(await res.text(), "ok");
});
