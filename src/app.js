const express = require("express");

const app = express();
const PORT = 3000;

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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});