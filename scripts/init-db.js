const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const dbPath = path.join(dataDir, "ai-panel-studio.sqlite");
const schemaPath = path.join(rootDir, "db", "schema.sql");
const seedPath = path.join(rootDir, "db", "seed.sql");

fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);
const schema = fs.readFileSync(schemaPath, "utf8");
const seed = fs.readFileSync(seedPath, "utf8");

db.exec(schema);
db.exec(seed);

const discussionCount = db.prepare("SELECT COUNT(*) AS count FROM discussions").get().count;
const participantCount = db.prepare("SELECT COUNT(*) AS count FROM participants").get().count;

db.close();

console.log(`SQLite initialized at ${dbPath}`);
console.log(`Seeded ${discussionCount} discussions and ${participantCount} participants.`);
