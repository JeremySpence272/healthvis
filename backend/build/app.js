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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sqlite3_1 = __importStar(require("sqlite3"));
const db = new sqlite3_1.default.Database("./data/daily.db", sqlite3_1.OPEN_READONLY);
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
const getQuery = (interval) => {
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
    return `SELECT ${groupBy} AS date, ROUND(AVG(weight),2) AS weight FROM weight GROUP BY ${groupBy} ORDER BY date ASC`;
};
app.get("/data/weight", (req, res) => {
    const interval = req.query.interval;
    const query = getQuery(interval);
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
const getSleepQuery = (interval, dataType) => {
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
    return `SELECT ${groupBy} AS date, ROUND(AVG(${dataType}),0) AS minutes FROM sleep GROUP BY ${groupBy} ORDER BY date ASC`;
};
app.get("/data/sleep", (req, res) => {
    const interval = req.query.interval;
    const dataType = req.query.dataType;
    const query = getSleepQuery(interval, dataType);
    db.all(query, (err, rows) => {
        if (err)
            res.status(500).json({ err: err.message });
        else
            res.send(rows);
    });
});
app.listen(3000, () => {
    console.log("Server running at 3000");
});
