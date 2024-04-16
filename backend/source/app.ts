import { NextFunction } from "connect";
import express, { Request, Response } from "express";
import sqlite3, { OPEN_READONLY } from "sqlite3";

const db: sqlite3.Database = new sqlite3.Database(
	"./data/daily.db",
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

type DateRange = {
	start?: string;
	end?: string;
};

const getQuery = (interval: Interval, dateRange: DateRange): string => {
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

	let queryStr = `SELECT ${groupBy} AS date, ROUND(AVG(weight),2) AS weight FROM weight`;

	if (dateRange.end && dateRange.start) {
		queryStr += ` WHERE date >= '${dateRange.start}' AND date <= '${dateRange.end}'`;
	}

	queryStr += ` GROUP BY ${groupBy} ORDER BY date ASC`;

	return queryStr;
};
app.get("/data/weight", (req: Request, res: Response) => {
	const interval: Interval = req.query.interval as Interval;
	const dateRange: DateRange = {
		start: (req.query.startDate as string) ?? undefined,
		end: (req.query.endDate as string) ?? undefined,
	};
	const query = getQuery(interval, dateRange);

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

const getSleepQuery = (
	interval: Interval,
	dataType: SleepOptions,
	dateRange: DateRange
): string => {
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
	let queryStr = `SELECT ${groupBy} AS date, ROUND(AVG(${dataType}),0) AS minutes FROM sleep`;

	if (dateRange.end && dateRange.start) {
		queryStr += ` WHERE date >= '${dateRange.start}' AND date <= '${dateRange.end}'`;
	}

	queryStr += ` GROUP BY ${groupBy} ORDER BY date ASC`;

	return queryStr;
};

app.get("/data/sleep", (req: Request, res: Response) => {
	const interval: Interval = req.query.interval as Interval;
	const dataType: SleepOptions = req.query.dataType as SleepOptions;
	const dateRange: DateRange = {
		start: (req.query.startDate as string) ?? undefined,
		end: (req.query.endDate as string) ?? undefined,
	};

	const query = getSleepQuery(interval, dataType, dateRange);
	db.all(query, (err, rows) => {
		if (err) res.status(500).json({ err: err.message });
		else res.send(rows);
	});
});

app.listen(3000, () => {
	console.log("Server running at 3000");
});
