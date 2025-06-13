const express = require("express")
const crypto = require("crypto")

const app = express()

app.use(express.json())
app.use(express.static("./public"))

const listeners = new Map();

setInterval(() => {
    for (const { res } of listeners.values()) {
        try {
            res.write(":ping\n\n");
        } catch (_ignored) {}
    }
}, 30_000);

app.post("/events", (req, res) => {
    for (const { res } of listeners.values()) {
        try {
            res.write(`data: ${JSON.stringify(req.body)}\n\n`);
        } catch (_ignored) {}
    }
    res.status(200).send("ok");
})

app.get("/events", (req, res) => {
    const headers = {
        Connection: "keep-alive",
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
    };
    res.writeHead(200, headers);

    const id = crypto.randomUUID();
    listeners.set(id, { id, res });
    req.on("close", () => listeners.delete(id));
})

app.listen(8432)
console.log("listening on 8432")

