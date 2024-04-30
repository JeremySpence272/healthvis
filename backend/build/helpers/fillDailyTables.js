"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.fillTables = void 0;
const sqlite3_1 = __importStar(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const dataConfigs_1 = require("./dataConfigs");
const { getNights } = require("../utils/sleepUtils");
const processData = (config, db) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`processing data for ${config.tableName}`);
    try {
        yield new Promise((resolve, reject) => {
            db.run(config.createTableSQL, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
        let rows = yield new Promise((resolve, reject) => {
            db.all(config.querySQL, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
        if (config.tableName === "sleep") {
            rows = getNights(rows);
        }
        const insertPromises = rows.map((record) => new Promise((resolve, reject) => {
            db.run(config.insertSQL, config.formatRecord(record), (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        }));
        yield Promise.all(insertPromises); // wait for records to be pushed
    }
    catch (err) {
        console.error(`err writing to table ${config.tableName}:`, err);
    }
});
const cleanupDB = (db) => __awaiter(void 0, void 0, void 0, function* () {
    yield new Promise((resolve, reject) => {
        db.run(`DROP TABLE IF EXISTS records;
		`, (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
});
const dbFilePath = path_1.default.join(__dirname, "..", "..", "upload-data", "records.db");
// can fill multiple tables
const fillTables = () => __awaiter(void 0, void 0, void 0, function* () {
    const db = new sqlite3_1.default.Database(dbFilePath, sqlite3_1.OPEN_READWRITE);
    const configs = [
        dataConfigs_1.heartConfig,
        dataConfigs_1.energyConfig,
        dataConfigs_1.weightConfig,
        dataConfigs_1.sleepConfig,
    ];
    for (const config of configs) {
        yield processData(config, db);
    }
    console.log("we done hea cleanup time");
    yield cleanupDB(db);
    console.log("fresh and clean");
});
exports.fillTables = fillTables;
