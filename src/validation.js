const PHASES = ["development", "pre_construction", "construction", "occupancy"];
const SECTORS = ["residential", "commercial", "institutional", "industrial"];

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function readParam(query, name) {
	const value = query[name];
	if (value === undefined) return { value: undefined };
	if (typeof value !== "string")
		return { error: `${name} must be a single value` };
	return { value };
}

function parseInteger(value) {
	if (!/^\d+$/.test(value)) return NaN;
	const n = Number(value);
	return Number.isSafeInteger(n) ? n : NaN;
}

function parseLeadsQuery(query) {
	const filters = {};

	const city = readParam(query, "city");
	if (city.error) return { error: city.error };
	if (city.value !== undefined) {
		const trimmed = city.value.trim();
		if (trimmed === "") return { error: "city must be a non-empty string" };
		filters.city = trimmed;
	}

	const phase = readParam(query, "phase");
	if (phase.error) return { error: phase.error };
	if (phase.value !== undefined) {
		if (!PHASES.includes(phase.value)) {
			return { error: `phase must be one of: ${PHASES.join(", ")}` };
		}
		filters.phase = phase.value;
	}

	const sector = readParam(query, "sector");
	if (sector.error) return { error: sector.error };
	if (sector.value !== undefined) {
		if (!SECTORS.includes(sector.value)) {
			return { error: `sector must be one of: ${SECTORS.join(", ")}` };
		}
		filters.sector = sector.value;
	}

	const minValue = readParam(query, "min_value");
	if (minValue.error) return { error: minValue.error };
	if (minValue.value !== undefined) {
		const n = minValue.value.trim() === "" ? NaN : Number(minValue.value);
		if (!Number.isFinite(n) || n < 0) {
			return { error: "min_value must be a non-negative number" };
		}
		filters.minValue = n;
	}

	const maxValue = readParam(query, "max_value");
	if (maxValue.error) return { error: maxValue.error };
	if (maxValue.value !== undefined) {
		const n = maxValue.value.trim() === "" ? NaN : Number(maxValue.value);
		if (!Number.isFinite(n) || n < 0) {
			return { error: "max_value must be a non-negative number" };
		}
		filters.maxValue = n;
	}

	if (
		filters.minValue !== undefined &&
		filters.maxValue !== undefined &&
		filters.maxValue < filters.minValue
	) {
		return { error: "max_value must be greater than or equal to min_value" };
	}

	const pageParam = readParam(query, "page");
	if (pageParam.error) return { error: pageParam.error };
	let page = DEFAULT_PAGE;
	if (pageParam.value !== undefined) {
		page = parseInteger(pageParam.value);
		if (Number.isNaN(page) || page < 1) {
			return { error: "page must be an integer >= 1" };
		}
	}

	const pageSizeParam = readParam(query, "page_size");
	if (pageSizeParam.error) return { error: pageSizeParam.error };
	let pageSize = DEFAULT_PAGE_SIZE;
	if (pageSizeParam.value !== undefined) {
		pageSize = parseInteger(pageSizeParam.value);
		if (Number.isNaN(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
			return {
				error: `page_size must be an integer from 1 to ${MAX_PAGE_SIZE}`,
			};
		}
	}

	return { filters, page, pageSize };
}

module.exports = { parseLeadsQuery };
