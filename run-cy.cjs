const { execSync } = require("child_process");

const file = process.argv[2];
if (!file) {
    console.error("❌ Please provide a test filename, e.g. npm run cy Slicer");
    process.exit(1);
}

const cmd = `npx cypress run --component --spec "src/**/${file}.cy.js"`;
console.log("▶️ Running:", cmd);
execSync(cmd, { stdio: "inherit" });