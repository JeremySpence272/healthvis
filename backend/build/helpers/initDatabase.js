"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseXMLAndInsertRecords = exports.initializeDatabase = void 0;
const fs_1 = __importDefault(require("fs"));
const sax_1 = __importDefault(require("sax"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const dbFilePath = path_1.default.join(__dirname, "..", "..", "upload-data", "records.db");
const BATCH_SIZE = 2000; // Define your batch size here
const initializeDatabase = () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3_1.default.Database(dbFilePath, sqlite3_1.default.OPEN_READWRITE | sqlite3_1.default.OPEN_CREATE, (err) => {
            if (err) {
                console.error("Database connection error:", err.message);
                return reject(err);
            }
            console.log("Connected to the SQLite database.");
            db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    console.error("Error fetching tables:", err.message);
                    return reject(err);
                }
                // Drop each table found
                for (const table of tables) {
                    if (table.name !== "sqlite_sequence") {
                        // skip the internal sequence table
                        yield new Promise((resolve, reject) => {
                            db.run(`DROP TABLE IF EXISTS ${table.name}`, (err) => {
                                if (err) {
                                    console.error(`Error dropping table ${table.name}:`, err.message);
                                    reject(err);
                                }
                                else {
                                    console.log(`Dropped table ${table.name}`);
                                    resolve();
                                }
                            });
                        });
                    }
                }
            }));
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
exports.initializeDatabase = initializeDatabase;
const parseXMLAndInsertRecords = (db, xmlPath) => {
    return new Promise((resolve, reject) => {
        const saxStream = sax_1.default.createStream(true, { trim: true });
        let records = [];
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
        saxStream.on("end", () => __awaiter(void 0, void 0, void 0, function* () {
            if (records.length > 0) {
                yield insertRecords(db, records); // Ensure the last batch of records is inserted
            }
            console.log("XML parsing and database insertion completed.");
            resolve();
        }));
        saxStream.on("error", (error) => {
            console.error("Error during XML parsing:", error);
            reject(error);
        });
        fs_1.default.createReadStream(xmlPath).pipe(saxStream);
    });
};
exports.parseXMLAndInsertRecords = parseXMLAndInsertRecords;
const insertRecords = (db, records) => {
    return new Promise((resolve, reject) => {
        const placeholders = records
            .map(() => "(?, ?, ?, ?, ?, ?, ?, ?)")
            .join(",");
        const flatRecords = records.flat();
        db.run(`INSERT INTO records (type, sourceName, sourceVersion, unit, creationDate, startDate, endDate, value) VALUES ${placeholders}`, flatRecords, (err) => {
            if (err) {
                console.error("Error inserting batch into database:", err.message);
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
};
