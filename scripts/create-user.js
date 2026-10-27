require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("../src/db");

async function main() {
	// npm run user:create user@groundwork.com user123
	const [email, password] = process.argv.slice(2);
	if (!email || !password) {
		console.log("Usage: node scripts/create-user.js <email> <password>");
		process.exit(1);
	}

	const hash = await bcrypt.hash(password, 12);
	await pool.query("INSERT INTO users (email, password_hash) VALUES ($1, $2)", [
		email.toLowerCase(),
		hash,
	]);
	console.log(`Created user ${email}`);
	await pool.end();
}

main().catch((err) => {
	console.error(err.message);
	process.exit(1);
});
