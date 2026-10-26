function buildLeadsQuery(filters, page, pageSize) {
	const conditions = [];
	const values = [];

	if (filters.city !== undefined) {
		values.push(filters.city);
		conditions.push(`city = $${values.length}`);
	}
	if (filters.phase !== undefined) {
		values.push(filters.phase);
		conditions.push(`phase = $${values.length}`);
	}
	if (filters.sector !== undefined) {
		values.push(filters.sector);
		conditions.push(`sector = $${values.length}`);
	}
	if (filters.minValue !== undefined) {
		values.push(filters.minValue);
		conditions.push(`est_value >= $${values.length}`);
	}
	if (filters.maxValue !== undefined) {
		values.push(filters.maxValue);
		conditions.push(`est_value <= $${values.length}`);
	}

	const where =
		conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

	// Fetch one extra row so the caller can tell whether another page exists.
	values.push(pageSize + 1);
	const limit = `$${values.length}`;
	values.push((page - 1) * pageSize);
	const offset = `$${values.length}`;

	const text = `
		SELECT id, address, city, phase, sector, est_value, units, filed_at
		FROM leads
		${where}
		ORDER BY filed_at DESC, id DESC
		LIMIT ${limit} OFFSET ${offset}
	`;

	return { text, values };
}

module.exports = { buildLeadsQuery };
