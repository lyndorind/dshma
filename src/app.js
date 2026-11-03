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

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;

app.get("/version", (req, res) => {
    res.json({
        version: require("../package.json").version
    });
});