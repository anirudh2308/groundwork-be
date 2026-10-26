const express = require("express");
const pool = require("../db");
const { parseLeadsQuery } = require("../validation");
const { buildLeadsQuery } = require("../queries");

const router = express.Router();

router.get("/", async (req, res) => {
	const parsed = parseLeadsQuery(req.query);
	if (parsed.error) {
		return res.status(400).json({ error: parsed.error });
	}

	const { filters, page, pageSize } = parsed;
	const { text, values } = buildLeadsQuery(filters, page, pageSize);

	try {
		const result = await pool.query(text, values);

		const hasMore = result.rows.length > pageSize;
		const data = result.rows.slice(0, pageSize);

		return res.json({
			data,
			page,
			page_size: pageSize,
			has_more: hasMore,
		});
	} catch (err) {
		console.error("Failed to fetch leads:", err.message);
		return res.status(500).json({ error: "Internal server error" });
	}
});

router.get("/:id", async (req, res) => {
	const { id } = req.params;

	if (!/^\d+$/.test(id)) {
		return res.status(400).json({ error: "id must be a positive integer" });
	}

	try {
		const result = await pool.query(
			`SELECT id, address, city, phase, sector, est_value, units, filed_at
			 FROM leads
			 WHERE id = $1`,
			[id],
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "Lead not found" });
		}

		return res.json(result.rows[0]);
	} catch (err) {
		console.error("Failed to fetch lead:", err.message);
		return res.status(500).json({ error: "Internal server error" });
	}
});

module.exports = router;
