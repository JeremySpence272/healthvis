import sqlite3, { Database, OPEN_READWRITE } from "sqlite3";
import path from "path";
import {
	sleepConfig,
	DataConfig,
	heartConfig,
	energyConfig,
	weightConfig,
} from "./dataConfigs";

const { getNights } = require("../utils/sleepUtils");

const processData = async (config: DataConfig, db: Database) => {
	console.log(`processing data for ${config.tableName}`);
	try {
		await new Promise<void>((resolve, reject) => {
			db!.run(config.createTableSQL, (err) => {
				if (err) reject(err);
				else resolve();
			});
		});

		let rows: any[] = await new Promise<any[]>((resolve, reject) => {
			db.all(config.querySQL, (err, rows) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});

		if (config.tableName === "sleep") {
			rows = getNights(rows);
		}

		const insertPromises: Promise<void>[] = rows.map(
			(record) =>
				new Promise<void>((resolve, reject) => {
					db!.run(config.insertSQL, config.formatRecord(record), (err) => {
						if (err) reject(err);
						else resolve();
					});
				})
		);

		await Promise.all(insertPromises); // wait for records to be pushed
	} catch (err) {
		console.error(`err writing to table ${config.tableName}:`, err);
	}
};

const cleanupDB = async (db: Database) => {
	await new Promise<void>((resolve, reject) => {
		db!.run(
			`DROP TABLE IF EXISTS records;
		`,
			(err) => {
				if (err) reject(err);
				else resolve();
			}
		);
	});
};

const dbFilePath = path.join(
	__dirname,
	"..",
	"..",
	"upload-data",
	"records.db"
);

// can fill multiple tables
export const fillTables = async () => {
	const db = new sqlite3.Database(dbFilePath, OPEN_READWRITE);
	const configs: DataConfig[] = [
		heartConfig,
		energyConfig,
		weightConfig,
		sleepConfig,
	];
	for (const config of configs) {
		await processData(config, db);
	}

	console.log("we done hea cleanup time");
	await cleanupDB(db);
	console.log("fresh and clean");
};
