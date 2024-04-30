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
const express_1 = __importDefault(require("express"));
const sqlite3_1 = __importStar(require("sqlite3"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const upload = (0, multer_1.default)({ dest: "uploads/" });
const db = new sqlite3_1.default.Database("./upload-data/records.db", sqlite3_1.OPEN_READONLY);
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((req, res, next) => {
    // set the CORS policy
    res.header("Access-Control-Allow-Origin", "*");
    // set the CORS headers
    res.header("Access-Control-Allow-Headers", "origin, X-Requested-With,Content-Type,Accept, Authorization");
    // set the CORS method headers
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "GET PATCH DELETE POST");
        return res.status(200).json({});
    }
    next();
});
const getQuery = (interval, dateRange) => {
    let groupBy = "";
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
app.get("/data/weight", (req, res) => {
    var _a, _b;
    const interval = req.query.interval;
    const dateRange = {
        start: (_a = req.query.startDate) !== null && _a !== void 0 ? _a : undefined,
        end: (_b = req.query.endDate) !== null && _b !== void 0 ? _b : undefined,
    };
    const query = getQuery(interval, dateRange);
    if (!["daily", "weekly", "monthly"].includes(interval)) {
        return res.status(400).json({ error: "invalid interval param" });
    }
    db.all(query, (err, rows) => {
        if (err)
            res.status(500).json({ err: err.message });
        else
            res.send(rows);
    });
});
var SleepOptions;
(function (SleepOptions) {
    SleepOptions["Total"] = "total";
    SleepOptions["Deep"] = "deep";
    SleepOptions["REM"] = "rem";
    SleepOptions["Core"] = "core";
    SleepOptions["Awake"] = "awake";
})(SleepOptions || (SleepOptions = {}));
const getSleepQuery = (interval, dataType, dateRange) => {
    let groupBy = "";
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
    let queryStr = `SELECT ${groupBy} AS date, ROUND(AVG(${dataType}),0) AS sleep FROM sleep`;
    if (dateRange.end && dateRange.start) {
        queryStr += ` WHERE date >= '${dateRange.start}' AND date <= '${dateRange.end}'`;
    }
    queryStr += ` GROUP BY ${groupBy} ORDER BY date ASC`;
    return queryStr;
};
app.get("/data/sleep", (req, res) => {
    var _a, _b;
    const interval = req.query.interval;
    const dataType = req.query.dataType;
    const dateRange = {
        start: (_a = req.query.startDate) !== null && _a !== void 0 ? _a : undefined,
        end: (_b = req.query.endDate) !== null && _b !== void 0 ? _b : undefined,
    };
    const query = getSleepQuery(interval, dataType, dateRange);
    db.all(query, (err, rows) => {
        if (err)
            res.status(500).json({ err: err.message });
        else
            res.send(rows);
    });
});
var HeartOptions;
(function (HeartOptions) {
    HeartOptions["max"] = "max";
    HeartOptions["min"] = "min";
    HeartOptions["avg"] = "avg";
    HeartOptions["resting"] = "restingAvg";
})(HeartOptions || (HeartOptions = {}));
const getHeartQuery = (interval, dataType, dateRange) => {
    let groupBy = "";
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
    let queryStr = `SELECT ${groupBy} AS date, ROUND(AVG(${dataType}),0) AS heart FROM heart`;
    if (dateRange.end && dateRange.start) {
        queryStr += ` WHERE date >= '${dateRange.start}' AND date <= '${dateRange.end}'`;
    }
    queryStr += ` GROUP BY ${groupBy} ORDER BY date ASC`;
    return queryStr;
};
app.get("/data/heart", (req, res) => {
    var _a, _b;
    const interval = req.query.interval;
    const dataType = req.query.dataType;
    const dateRange = {
        start: (_a = req.query.startDate) !== null && _a !== void 0 ? _a : undefined,
        end: (_b = req.query.endDate) !== null && _b !== void 0 ? _b : undefined,
    };
    const query = getHeartQuery(interval, dataType, dateRange);
    db.all(query, (err, rows) => {
        if (err)
            res.status(500).json({ err: err.message });
        else
            res.send(rows);
    });
});
var EnergyOptions;
(function (EnergyOptions) {
    EnergyOptions["total"] = "total";
    EnergyOptions["active"] = "active";
    EnergyOptions["basal"] = "basal";
})(EnergyOptions || (EnergyOptions = {}));
const getEnergyQuery = (interval, dataType, dateRange) => {
    let groupBy = "";
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
    let queryStr = `SELECT ${groupBy} AS date, ROUND(AVG(${dataType}),0) AS energy FROM energy`;
    if (dateRange.end && dateRange.start) {
        queryStr += ` WHERE date >= '${dateRange.start}' AND date <= '${dateRange.end}'`;
    }
    queryStr += ` GROUP BY ${groupBy} ORDER BY date ASC`;
    return queryStr;
};
app.get("/data/energy", (req, res) => {
    var _a, _b;
    const interval = req.query.interval;
    const dataType = req.query.dataType;
    const dateRange = {
        start: (_a = req.query.startDate) !== null && _a !== void 0 ? _a : undefined,
        end: (_b = req.query.endDate) !== null && _b !== void 0 ? _b : undefined,
    };
    const query = getEnergyQuery(interval, dataType, dateRange);
    db.all(query, (err, rows) => {
        if (err)
            res.status(500).json({ err: err.message });
        else
            res.send(rows);
    });
});
////////////////////////////////////////////////////////////////////////
//////////////////////// POST FILE ROUTE ///////////////////////////////
////////////////////////////////////////////////////////////////////////
const initDatabase_1 = require("./helpers/initDatabase");
const fillDailyTables_1 = require("./helpers/fillDailyTables");
app.post("/upload", upload.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.file) {
        const path = req.file.path;
        console.log(path);
        try {
            const db = yield (0, initDatabase_1.initializeDatabase)();
            yield (0, initDatabase_1.parseXMLAndInsertRecords)(db, path);
            yield (0, fillDailyTables_1.fillTables)();
            res.send("Data processing completed successfully.");
            fs_1.default.unlink(path, (err) => {
                if (err) {
                    console.error("Failed to delete the file:", err);
                    return;
                }
                console.log("File deleted successfully");
            });
        }
        catch (err) {
            if (err instanceof Error) {
                res.send({ error: err.message });
            }
        }
    }
    else {
        console.log("no file");
    }
}));
app.listen(3000, () => {
    console.log("Server running at 3000");
});
