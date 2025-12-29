import { execSync } from "node:child_process";

function killPort(portNumber) {
    try {
        const output = execSync(`lsof -ti tcp:${portNumber}`, { stdio: ["ignore", "pipe", "ignore"] })
            .toString()
            .trim();

        if (!output) return;

        const processIdentifiers = output.split("\n").filter(Boolean);
        for (const processIdentifier of processIdentifiers) {
            execSync(`kill -9 ${processIdentifier}`, { stdio: "ignore" });
        }
    } catch {
        // No process on that port (or lsof not available)
    }
}

killPort(3030);
killPort(5173);
killPort(5174);
killPort(5175);

console.log("Stopped processes");
