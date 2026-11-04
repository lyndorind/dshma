const { spawn } = require("node:child_process");
const path = require("node:path");
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

test("application should start as main module", async () => {
    const appPath = path.join(__dirname, "..", "src", "app.js");

    const child = spawn(process.execPath, [appPath]);

    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            child.kill();
            reject(new Error("Server did not start in time"));
        }, 5000);

        child.stdout.on("data", (data) => {
            if (data.toString().includes("Server running on port")) {
                clearTimeout(timeout);
                child.kill();
                resolve();
            }
        });

        child.on("error", (error) => {
            clearTimeout(timeout);
            reject(error);
        });
    });
});