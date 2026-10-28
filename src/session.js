const session = require("express-session");
const PgStore = require("connect-pg-simple")(session);
const pool = require("./db");

if (!process.env.SESSION_SECRET) {
	throw new Error("SESSION_SECRET is not set");
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

module.exports = session({
	store: new PgStore({ pool, tableName: "session" }),
	name: "gw.sid",
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.COOKIE_SECURE === "true",
		maxAge: SEVEN_DAYS_MS,
	},
});
