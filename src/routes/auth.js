const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const pool = require("../db");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: "draft-7",
	legacyHeaders: false,
	message: { error: "Too many login attempts, please try again later." },
});

router.post("/login", loginLimiter, async (req, res) => {
	const { email, password } = req.body || {};
	if (
		typeof email !== "string" ||
		typeof password !== "string" ||
		!email.trim() ||
		!password
	) {
		return res.status(400).json({ error: "email and password are required" });
	}

	try {
		const result = await pool.query(
			"SELECT id, email, password_hash FROM users WHERE email = $1",
			[email.trim().toLowerCase()],
		);
		const user = result.rows[0];

		if (!user || !(await bcrypt.compare(password, user.password_hash))) {
			return res.status(401).json({ error: "Invalid email or password" });
		}

		req.session.regenerate((err) => {
			if (err) {
				console.error("Session regenerate failed:", err.message);
				return res.status(500).json({ error: "Internal server error" });
			}
			req.session.userId = user.id;
			res.json({ id: user.id, email: user.email });
		});
	} catch (err) {
		console.error("Login failed:", err.message);
		return res.status(500).json({ error: "Internal server error" });
	}
});

router.post("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.error("Session destroy failed:", err.message);
			return res.status(500).json({ error: "Internal server error" });
		}
		res.clearCookie("gw.sid");
		res.status(204).end();
	});
});

router.get("/me", requireAuth, async (req, res) => {
	try {
		const result = await pool.query(
			"SELECT id, email FROM users WHERE id = $1",
			[req.session.userId],
		);
		if (result.rows.length === 0) {
			return res.status(401).json({ error: "Unauthorized" });
		}
		return res.json(result.rows[0]);
	} catch (err) {
		console.error("Failed to fetch current user:", err.message);
		return res.status(500).json({ error: "Internal server error" });
	}
});

module.exports = router;
