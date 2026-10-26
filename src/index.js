require("dotenv").config();

const express = require("express");
const pool = require("./db");
const requestTimer = require("./middlewares/requestTimer");
const rateLimit = require("express-rate-limit");

const leadsRouter = require("./routes/leads");

const leadsLimiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 5,
	standardHeaders: "draft-7",
	legacyHeaders: false,
	message: { error: "Too many requests, please try again later." },
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(requestTimer);

app.use("/leads", leadsLimiter, leadsRouter);

app.get("/health", async (req, res) => {
	try {
		await pool.query("SELECT 1");
		res.json({ status: "ok" });
	} catch (err) {
		console.error("Health check failed:", err.code || err.message);
		res.status(500).json({ status: "error", message: "database unreachable" });
	}
});

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
