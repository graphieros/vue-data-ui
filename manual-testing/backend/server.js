import http from "node:http";
import { promises as fileSystem } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectoryPath = path.dirname(currentFilePath);

const hostName = "127.0.0.1";
const portNumber = 3030;

const allowedOrigins = new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5175",
    "http://localhost:5175",
    "http://127.0.0.1:5174",
    "http://localhost:3030",
    "http://127.0.0.1:3030",
]);

function applyCors(request, response) {
    const origin = request.headers.origin;

    if (origin && allowedOrigins.has(origin)) {
        response.setHeader("Access-Control-Allow-Origin", origin);
        response.setHeader("Vary", "Origin");
    }

    response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const databaseFilePath = path.join(currentDirectoryPath, "database.json");

function writeJsonResponse(response, statusCode, payload, request) {
    const body = JSON.stringify(payload, null, 2);

    response.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": Buffer.byteLength(body),
    });

    applyCors(request, response);
    response.end(body);
}

const MAX_BODY_SIZE_BYTES = 1024 * 1024;

async function readRequestBodyAsJson(request) {
    let totalSize = 0;
    const chunks = [];

    for await (const chunk of request) {
        totalSize += chunk.length;
        if (totalSize > MAX_BODY_SIZE_BYTES) {
            throw new Error("Request body too large");
        }
        chunks.push(chunk);
    }

    const raw = Buffer.concat(chunks).toString("utf-8").trim();
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return undefined;
    }
}

async function ensureDatabaseFileExists() {
    try {
        await fileSystem.access(databaseFilePath);
    } catch {
        const initialDatabase = { items: [] };
        await fileSystem.writeFile(
            databaseFilePath,
            JSON.stringify(initialDatabase, null, 2),
            "utf-8"
        );
    }
}

async function readDatabase() {
    await ensureDatabaseFileExists();
    const contents = await fileSystem.readFile(databaseFilePath, "utf-8");
    const parsed = JSON.parse(contents);

    if (!parsed || typeof parsed !== "object") return { items: [] };
    if (!Array.isArray(parsed.items)) return { items: [] };

    return parsed;
}

async function writeDatabase(database) {
    await fileSystem.writeFile(databaseFilePath, JSON.stringify(database, null, 2), "utf-8");
}

function createIdentifier() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseUrl(requestUrl) {
    const urlObject = new URL(requestUrl, `http://${hostName}:${portNumber}`);
    return { pathName: urlObject.pathname };
}

function matchRoute(pathName) {
    if (pathName === "/api/items") return { routeName: "itemsRoot", identifier: null };

    const match = pathName.match(/^\/api\/items\/([^/]+)$/);
    if (match) return { routeName: "itemsByIdentifier", identifier: decodeURIComponent(match[1]) };

    return { routeName: "notFound", identifier: null };
}

const server = http.createServer(async (request, response) => {
    try {
        if (request.method === "OPTIONS") {
            response.writeHead(204);
            applyCors(request, response);
            response.end();
            return;
        }

        const { pathName } = parseUrl(request.url ?? "/");
        const { routeName, identifier } = matchRoute(pathName);

        if (routeName === "notFound") {
            writeJsonResponse(response, 404, { error: "Not found" }, request);
            return;
        }

        const database = await readDatabase();

        if (routeName === "itemsRoot" && request.method === "GET") {
            writeJsonResponse(response, 200, { items: database.items }, request);
            return;
        }

        if (routeName === "itemsByIdentifier" && request.method === "GET") {
            const item = database.items.find((entry) => String(entry.id) === String(identifier));
            if (!item) {
                writeJsonResponse(response, 404, { error: "Item not found" }, request);
                return;
            }
            writeJsonResponse(response, 200, { item }, request);
            return;
        }

        if (routeName === "itemsRoot" && request.method === "POST") {
            const body = await readRequestBodyAsJson(request);
            if (body === undefined) {
                writeJsonResponse(response, 400, { error: "Invalid JSON body" }, request);
                return;
            }
            if (!body || typeof body !== "object") {
                writeJsonResponse(response, 400, { error: "Body must be a JSON object" }, request);
                return;
            }

            const item = { ...body };
            if (item.id === undefined || item.id === null || item.id === "") {
                item.id = createIdentifier();
            }

            database.items.push(item);
            await writeDatabase(database);

            writeJsonResponse(response, 201, { item }, request);
            return;
        }

        if (routeName === "itemsByIdentifier" && request.method === "PUT") {
            const body = await readRequestBodyAsJson(request);
            if (body === undefined) {
                writeJsonResponse(response, 400, { error: "Invalid JSON body" }, request);
                return;
            }
            if (!body || typeof body !== "object") {
                writeJsonResponse(response, 400, { error: "Body must be a JSON object" }, request);
                return;
            }

            const index = database.items.findIndex((entry) => String(entry.id) === String(identifier));
            if (index === -1) {
                writeJsonResponse(response, 404, { error: "Item not found" }, request);
                return;
            }

            const existing = database.items[index];
            const updated = { ...existing, ...body, id: existing.id };

            database.items[index] = updated;
            await writeDatabase(database);

            writeJsonResponse(response, 200, { item: updated }, request);
            return;
        }

        if (routeName === "itemsByIdentifier" && request.method === "DELETE") {
            const index = database.items.findIndex((entry) => String(entry.id) === String(identifier));
            if (index === -1) {
                writeJsonResponse(response, 404, { error: "Item not found" }, request);
                return;
            }

            const [removed] = database.items.splice(index, 1);
            await writeDatabase(database);

            writeJsonResponse(response, 200, { deleted: removed }, request);
            return;
        }

        writeJsonResponse(response, 405, { error: "Method not allowed" }, request);
    } catch (error) {
        if (String(error?.message) === "Request body too large") {
            writeJsonResponse(response, 413, { error: "Payload too large" }, request);
            return;
        }
        writeJsonResponse(response, 500, { error: "Server error", details: String(error?.message ?? error) }, request);
    }
});

server.listen(portNumber, hostName, async () => {
    await ensureDatabaseFileExists();
    console.log(`Backend service running at http://${hostName}:${portNumber}`);
    console.log(`Database file: ${databaseFilePath}`);
});

function shutdown(signalName) {
    console.log(`Received ${signalName}. Closing server...`);

    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });

    setTimeout(() => {
        console.log("Force exiting.");
        process.exit(1);
    }, 1500).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGHUP", () => shutdown("SIGHUP"));