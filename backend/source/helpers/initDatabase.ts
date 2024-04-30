import fs from "fs";
import sax from "sax";
import sqlite3, { Database } from "sqlite3";
import path from "path";

const dbFilePath = path.join(
	__dirname,
	"..",
	"..",
	"upload-data",
	"records.db"
);

const BATCH_SIZE = 2000; // Define your batch size here

type TableInfo = {
	name: string;
};
export const initializeDatabase = (): Promise<Database> => {
	return new Promise((resolve, reject) => {
		const db = new sqlite3.Database(
			dbFilePath,
			sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
			(err) => {
				if (err) {
					console.error("Database connection error:", err.message);
					return reject(err);
				}
				console.log("Connected to the SQLite database.");
				db.all(
					"SELECT name FROM sqlite_master WHERE type='table'",
					async (err, tables: TableInfo[]) => {
						if (err) {
							console.error("Error fetching tables:", err.message);
							return reject(err);
						}

						// Drop each table found
						for (const table of tables) {
							if (table.name !== "sqlite_sequence") {
								// skip the internal sequence table
								await new Promise<void>((resolve, reject) => {
									db.run(`DROP TABLE IF EXISTS ${table.name}`, (err) => {
										if (err) {
											console.error(
												`Error dropping table ${table.name}:`,
												err.message
											);
											reject(err);
										} else {
											console.log(`Dropped table ${table.name}`);
											resolve();
										}
									});
								});
							}
						}
					}
				);
				db.run(
					`CREATE TABLE IF NOT EXISTS records (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        type TEXT,
                        sourceName TEXT,
                        sourceVersion TEXT,
                        unit TEXT,
                        creationDate TEXT,
                        startDate TEXT,
                        endDate TEXT,
                        value TEXT
                    )`,
					(err) => {
						if (err) return reject(err);
						console.log("Table created or already exists.");
						resolve(db);
					}
				);
			}
		);
	});
};

export const parseXMLAndInsertRecords = (
	db: Database,
	xmlPath: string
): Promise<void> => {
	return new Promise((resolve, reject) => {
		const saxStream = sax.createStream(true, { trim: true });
		let records: any[][] = [];
		const BATCH_SIZE = 2000; // Define BATCH_SIZE as needed

		saxStream.on("opentag", (node) => {
			if (node.name === "Record") {
				records.push([
					node.attributes.type,
					node.attributes.sourceName,
					node.attributes.sourceVersion,
					node.attributes.unit,
					node.attributes.creationDate,
					node.attributes.startDate,
					node.attributes.endDate,
					node.attributes.value,
				]);
			}
		});

		saxStream.on("closetag", (tagName) => {
			if (tagName === "Record" && records.length >= BATCH_SIZE) {
				insertRecords(db, records);
				records = []; // Clear the records array for the next batch
			}
		});

		saxStream.on("end", async () => {
			if (records.length > 0) {
				await insertRecords(db, records); // Ensure the last batch of records is inserted
			}
			console.log("XML parsing and database insertion completed.");
			resolve();
		});

		saxStream.on("error", (error) => {
			console.error("Error during XML parsing:", error);
			reject(error);
		});

		fs.createReadStream(xmlPath).pipe(saxStream);
	});
};

const insertRecords = (db: Database, records: any[][]): Promise<void> => {
	return new Promise((resolve, reject) => {
		const placeholders = records
			.map(() => "(?, ?, ?, ?, ?, ?, ?, ?)")
			.join(",");
		const flatRecords = records.flat();
		db.run(
			`INSERT INTO records (type, sourceName, sourceVersion, unit, creationDate, startDate, endDate, value) VALUES ${placeholders}`,
			flatRecords,
			(err) => {
				if (err) {
					console.error("Error inserting batch into database:", err.message);
					reject(err);
				} else {
					resolve();
				}
			}
		);
	});
};
