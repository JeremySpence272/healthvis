import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
// const {
// 	heartConfig,
// 	sleepConfig,
// 	energyConfig,
// 	weightConfig,
// } = require("./dataConfigs");

import {
	sleepConfig,
	DataConfig,
	heartConfig,
	energyConfig,
	weightConfig,
} from "./dataConfigs";

const { getNights } = require("../utils/sleepUtils");

async function processData(config: DataConfig) {
	let db: Database | null = null;
	let daily_db: Database | null = null;
	try {
		db = await open({
			filename: "../../data/database.db",
			driver: sqlite3.Database,
		});

		daily_db = await open({
			filename: "../../data/daily.db",
			driver: sqlite3.Database,
		});

		await daily_db.run(config.createTableSQL); // create new table if not exists
		let rows: any[] = await db.all(config.querySQL); // read from all records
		if (config.tableName === "sleep") {
			// additional logic needed for sleep data
			rows = getNights(rows);
		}

		const insertPromises: Promise<void>[] = rows.map(
			(record) =>
				daily_db!
					.run(config.insertSQL, config.formatRecord(record))
					.then(() => {}) // push records to new database don't need to return anythign
		);

		await Promise.all(insertPromises); // wait for records to be pushed
	} catch (err) {
		console.error(`err writing to table ${config.tableName}:`, err);
	} finally {
		if (db) {
			await db.close(); // close when done
			await daily_db?.close();
		}
	}
}

// can fill multiple tables
const fillTables = async (configs: DataConfig[]) => {
	for (const config of configs) {
		await processData(config);
	}
};

fillTables([heartConfig, energyConfig, weightConfig]);
//options are [heartConfig, sleepConfig, energyConfig, weightConfig]
