import { NextFunction } from "connect";
import express, { Request, Response } from "express";
import sqlite3, { OPEN_READONLY } from "sqlite3";

const db: sqlite3.Database = new sqlite3.Database(
	"../data/database.db",
	OPEN_READONLY
);
const app = express();
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
	// set the CORS policy
	res.header("Access-Control-Allow-Origin", "*");
	// set the CORS headers
	res.header(
		"Access-Control-Allow-Headers",
		"origin, X-Requested-With,Content-Type,Accept, Authorization"
	);
	// set the CORS method headers
	if (req.method === "OPTIONS") {
		res.header("Access-Control-Allow-Methods", "GET PATCH DELETE POST");
		return res.status(200).json({});
	}
	next();
});

type Interval = "daily" | "weekly" | "monthly";

const getQuery = (interval: Interval): string => {
	let groupBy: string = "";
	switch (interval) {
		case "weekly":
			groupBy = `strftime('%Y-W%W', date)`;
			break;
		case "monthly":
			groupBy = `strftime('%Y-%m', date)`;
			break;
		default:
			groupBy = `date`;
			break;
	}

	return `SELECT ${groupBy} AS date, ROUND(AVG(weight),2) AS plot, COUNT(*) as count FROM weight GROUP BY ${groupBy} ORDER BY date ASC`;
};
app.get("/data/weight", (req: Request, res: Response) => {
	const interval: Interval = req.query.interval as Interval;
	const query = getQuery(interval);

	if (!["daily", "weekly", "monthly"].includes(interval)) {
		return res.status(400).json({ error: "invalid interval param" });
	}

	db.all(query, (err, rows) => {
		if (err) res.status(500).json({ err: err.message });
		else res.send(rows);
	});
});

enum SleepOptions {
	Total = "total",
	Deep = "deep",
	REM = "rem",
	Core = "core",
	Awake = "awake",
}

const getSleepQuery = (interval: Interval, dataType: SleepOptions): string => {
	let groupBy: string = "";
	switch (interval) {
		case "weekly":
			groupBy = `strftime('%Y-W%W', date)`;
			break;
		case "monthly":
			groupBy = `strftime('%Y-%m', date)`;
			break;
		default:
			groupBy = `date`;
			break;
	}

	return `SELECT ${groupBy} AS date, ROUND(AVG(${dataType}),0) AS plot, COUNT(*) as count FROM sleep GROUP BY ${groupBy} ORDER BY date ASC`;
};

app.get("/data/sleep", (req: Request, res: Response) => {
	const interval: Interval = req.query.interval as Interval;
	const dataType: SleepOptions = req.query.dataType as SleepOptions;

	const query = getSleepQuery(interval, dataType);
	db.all(query, (err, rows) => {
		if (err) res.status(500).json({ err: err.message });
		else res.send(rows);
	});
});

app.listen(3000, () => {
	console.log("Server running at 3000");
});
