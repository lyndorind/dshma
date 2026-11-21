const { spawn } = require("node:child_process");
const path = require("node:path");
const { test } = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const { pool, initDatabase } = require("../src/db");
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

test("GET /items should return items from database", async () => {
    const originalQuery = pool.query;

    pool.query = async () => ({
        rows: [
            {
                id: 1,
                name: "Test item",
                created_at: new Date().toISOString()
            }
        ]
    });

    try {
        const response = await request(app).get("/items");

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.length, 1);
        assert.strictEqual(response.body[0].id, 1);
        assert.strictEqual(response.body[0].name, "Test item");
    } finally {
        pool.query = originalQuery;
    }
});

test("GET /items should return 500 when database query fails", async () => {
    const originalQuery = pool.query;

    pool.query = async () => {
        throw new Error("Database error");
    };

    try {
        const response = await request(app).get("/items");

        assert.strictEqual(response.statusCode, 500);
        assert.strictEqual(response.body.error, "Failed to get items");
    } finally {
        pool.query = originalQuery;
    }
});

test("POST /items should create a new item", async () => {
    const originalQuery = pool.query;

    pool.query = async () => ({
        rows: [
            {
                id: 1,
                name: "New item",
                created_at: new Date().toISOString()
            }
        ]
    });

    try {
        const response = await request(app)
            .post("/items")
            .send({
                name: "New item"
            });

        assert.strictEqual(response.statusCode, 201);
        assert.strictEqual(response.body.id, 1);
        assert.strictEqual(response.body.name, "New item");
    } finally {
        pool.query = originalQuery;
    }
});

test("POST /items should return 400 when name is missing", async () => {
    const response = await request(app)
        .post("/items")
        .send({});

    assert.strictEqual(response.statusCode, 400);
    assert.strictEqual(response.body.error, "Name is required");
});

test("POST /items should return 500 when database query fails", async () => {
    const originalQuery = pool.query;

    pool.query = async () => {
        throw new Error("Database error");
    };

    try {
        const response = await request(app)
            .post("/items")
            .send({
                name: "Test item"
            });

        assert.strictEqual(response.statusCode, 500);
        assert.strictEqual(response.body.error, "Failed to create item");
    } finally {
        pool.query = originalQuery;
    }
});

test("initDatabase should create items table", async () => {
    const originalQuery = pool.query;
    let executedQuery = "";

    pool.query = async (query) => {
        executedQuery = query;
        return {};
    };

    try {
        await initDatabase();

        assert.ok(executedQuery.includes("CREATE TABLE IF NOT EXISTS items"));
    } finally {
        pool.query = originalQuery;
    }
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