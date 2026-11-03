const { test } = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const app = require("../src/app");

test("GET / should return 200", async () => {
    const response = await request(app).get("/");

    assert.strictEqual(response.statusCode, 200);
});

test("GET /health should return 200", async () => {
    const response = await request(app).get("/health");

    assert.strictEqual(response.statusCode, 200);
});

test("GET /version should return application version", async () => {
    const response = await request(app).get("/version");

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.body.version, "1.1.0");
});