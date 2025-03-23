const { existsSync, statSync, readdirSync, readFileSync } = require("fs")
const http = require("http")
const { join, resolve, normalize } = require("path")

const port = 8432
const workDir = resolve(process.argv[2] ?? "")
const types = {
    "js": "text/javascript",
    "html": "text/html",
    "json": "application/json",
    "mp3": "audio/mpeg",
    "mp4": "video/mp4",
    "jpg": "image/jpg",
    "jpeg": "image/jpeg",
    "css": "text/css",
    "ttf": "font/ttf"
}

const server = http.createServer(async (req, res) => {
    const reqPath = new URL(req.url, "http://self")
    let path = normalize(join(workDir, decodeURIComponent(reqPath.pathname)))
        .replace(/\\/g, "/") // Unwindows

    // If any entry starts with ., deny it
    if (path.split("/").find((part) => part.startsWith("."))) {
        res.writeHead(403)
        return res.end("Check http.cat/403")
    }

    // Make sure file exists
    const exists = existsSync(path)
    if (!exists && existsSync(`${path}.html`)) {
        path += ".html"
    } else if (!exists) {
        res.writeHead(404)
        return res.end("Not found.")
    }

    console.log("->", path)
    
    // Is this a directory?
    const isDirectory = statSync(path).isDirectory()
    if (isDirectory) {
        let fileList = []
        try {
            for (const filename of readdirSync(path)) {
                const entryIsDirectory = statSync(join(path, filename)).isDirectory()
                fileList.push(`http://localhost:8432${reqPath.pathname.replace(/\/$/, "")}/${filename}${entryIsDirectory ? "/" : ""}`)
            }
        } catch (e) {
            console.error("Filesystem error, directory listing.", e)
            res.writeHead(500)
            res.end("Filesystem error.")
        }
        if (res.writable) {
            res.writeHead(200, {
                "Content-Type": "application/json"
            })
            res.end(JSON.stringify(fileList))
        }
    } else {
        // This is a file
        // Try to guess mimetype
        const mimeType = types[path.split(".").reverse()[0]] ?? "text/plain"

        // Try to read
        let data = null
        try {
            data = readFileSync(path)
        } catch (e) {
            console.error("Filesystem error, reading.", e)
            res.writeHead(500)
            res.end("Filesystem error.")
        }

        // Send data if we did not error
        if (!res.writable) return
        res.writeHead(200, {
            "Content-Type": mimeType
        })
        res.end(data)
    }
})

server.listen(port, () => console.log(`Listening in ${port}`))
