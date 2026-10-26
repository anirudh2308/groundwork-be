require("dotenv").config();

const fs = require("fs");
const path = require("path");
const pool = require("../src/db");

async function main() {
	const file = process.argv[2];
	if (!file) {
		console.error("Usage: node scripts/run-sql.js <file.sql>");
		process.exit(1);
	}

	const sql = fs.readFileSync(path.resolve(file), "utf8");
	const started = Date.now();

	console.log(`Running ${file}...`);
	await pool.query(sql);
	console.log(`Done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

main()
	.catch((err) => {
		console.error("SQL run failed:", err.message);
		process.exitCode = 1;
	})
	.finally(() => pool.end());
