const express = require("express");
const { pool, initDatabase } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Git Lab 2 REST API",
        version: "1.0.0"
    });
});

app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        service: "gitlab2",
        timestamp: new Date().toISOString()
    });
});

app.get("/version", (req, res) => {
    res.json({
        version: require("../package.json").version
    });
});

// ---------------- DATABASE API ----------------

app.get("/items", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, created_at FROM items ORDER BY id"
        );

        res.json(result.rows);
    } catch {
        res.status(500).json({
            error: "Failed to get items"
        });
    }
});

app.post("/items", async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            error: "Name is required"
        });
    }

    try {
        const result = await pool.query(
            "INSERT INTO items (name) VALUES ($1) RETURNING id, name, created_at",
            [name]
        );

        return res.status(201).json(result.rows[0]);
    } catch {
        return res.status(500).json({
            error: "Failed to create item"
        });
    }
});

/* c8 ignore start */
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    initDatabase()
        .then(() => {
            console.log("Database initialized");
        })
        .catch((error) => {
            console.error("Failed to initialize database:", error.message);
        });
}
/* c8 ignore stop */

module.exports = app;