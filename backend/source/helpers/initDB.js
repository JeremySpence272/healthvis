const fs = require("fs");
const readline = require("readline");
const sqlite3 = require("sqlite3").verbose();

const initializeDatabase = () => {
	return new Promise((resolve, reject) => {
		const db = new sqlite3.Database(
			"../data/database.db",
			sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
			(err) => {
				if (err) return reject(err);
				console.log("Connected to the SQLite database.");
				db.run(
					`CREATE TABLE IF NOT EXISTS all_records (
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

const processFileAndInsertRecords = (db) => {
	const jsonFilePath = "../data/data.json";
	const fileStream = fs.createReadStream(jsonFilePath);
	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity,
	});

	const records = [];
	rl.on("line", (line) => {
		const record = JSON.parse(line);
		records.push([
			record.type,
			record.sourceName,
			record.sourceVersion,
			record.unit,
			record.creationDate,
			record.startDate,
			record.endDate,
			record.value,
		]);
		if (records.length >= 1000) {
			// Adjust batch size as needed
			db.run(
				"INSERT INTO all_records (type, sourceName, sourceVersion, unit, creationDate, startDate, endDate, value) VALUES " +
					records.map(() => "(?, ?, ?, ?, ?, ?, ?, ?)").join(","),
				records.flat(),
				(err) => {
					if (err)
						console.error(
							"Error inserting records into database:",
							err.message
						);
				}
			);
			records.length = 0; // Clear the records array
		}
	});

	rl.on("close", () => {
		if (records.length > 0) {
			db.run(
				"INSERT INTO all_records (type, sourceName, sourceVersion, unit, creationDate, startDate, endDate, value) VALUES " +
					records.map(() => "(?, ?, ?, ?, ?, ?, ?, ?)").join(","),
				records.flat(),
				(err) => {
					if (err)
						console.error(
							"Error inserting records into database:",
							err.message
						);
				}
			);
		}
		console.log("Finished reading the file.");
		db.close((err) => {
			if (err) console.error(err.message);
			console.log("Closed the database connection.");
		});
	});
};

initializeDatabase()
	.then((db) => {
		processFileAndInsertRecords(db);
	})
	.catch((err) => {
		console.error("Database initialization failed:", err.message);
	});
