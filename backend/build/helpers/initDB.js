"use strict";
const fs = require("fs");
const sax = require("sax");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dbFilePath = path.join(__dirname, "..", "..", "upload-data", "records.db");
const BATCH_SIZE = 1000; // Define your batch size here
const initializeDatabase = () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbFilePath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                console.error("Database connection error:", err.message);
                return reject(err);
            }
            console.log("Connected to the SQLite database.");
            db.run(`CREATE TABLE IF NOT EXISTS records (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        type TEXT,
                        sourceName TEXT,
                        sourceVersion TEXT,
                        unit TEXT,
                        creationDate TEXT,
                        startDate TEXT,
                        endDate TEXT,
                        value TEXT
                    )`, (err) => {
                if (err)
                    return reject(err);
                console.log("Table created or already exists.");
                resolve(db);
            });
        });
    });
};
const parseXMLAndInsertRecords = (db, xmlPath) => {
    const saxStream = sax.createStream(true, { trim: true });
    let records = [];
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
            records = []; // Clear the records array for next batch
        }
    });
    saxStream.on("end", () => {
        if (records.length > 0) {
            insertRecords(db, records); // Insert any remaining records
        }
        console.log("XML parsing and database insertion completed.");
        db.close((err) => {
            if (err)
                console.error("Failed to close the database:", err.message);
            else
                console.log("Closed the database connection.");
        });
    });
    fs.createReadStream(xmlPath).pipe(saxStream);
};
const insertRecords = (db, records) => {
    const placeholders = records.map(() => "(?, ?, ?, ?, ?, ?, ?, ?)").join(",");
    const flatRecords = records.flat();
    db.run(`INSERT INTO records (type, sourceName, sourceVersion, unit, creationDate, startDate, endDate, value) VALUES ${placeholders}`, flatRecords, (err) => {
        if (err) {
            console.error("Error inserting batch into database:", err.message);
        }
    });
};
module.exports.initializeDatabase = initializeDatabase;
module.exports.parseXMLAndInsertRecords = parseXMLAndInsertRecords;
