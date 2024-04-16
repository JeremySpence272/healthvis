"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weightConfig = exports.energyConfig = exports.sleepConfig = exports.heartConfig = void 0;
const heartConfig = {
    tableName: "heart",
    createTableSQL: `
        CREATE TABLE IF NOT EXISTS heart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            max TEXT,
            min TEXT,
            avg TEXT,
            restingAvg TEXT
        )`,
    querySQL: `
        SELECT 
            SUBSTR(creationDate, 1, 10) AS date,
            AVG(CAST(value AS FLOAT)) AS average,
            MIN(CAST(value AS FLOAT)) AS minimum,
            MAX(CAST(value AS FLOAT)) AS maximum,
            AVG(CAST(value AS FLOAT)) AS restingAvg
        FROM 
            all_records
        WHERE 
            type IN ('HKQuantityTypeIdentifierHeartRate', 'HKQuantityTypeIdentifierRestingHeartRate')
            AND sourceName LIKE '%Watch%'
        GROUP BY 
            SUBSTR(creationDate, 1, 10)`,
    insertSQL: `
        INSERT INTO heart (date, max, min, avg, restingAvg)
        VALUES (?, ?, ?, ?, ?)`,
    formatRecord: (record) => [
        record.date,
        record.maximum,
        record.minimum,
        record.average,
        record.restingAvg,
    ],
};
exports.heartConfig = heartConfig;
const energyConfig = {
    tableName: "energy",
    createTableSQL: `
        CREATE TABLE IF NOT EXISTS energy (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            basal TEXT,
            active TEXT,
            total TEXT
        )`,
    querySQL: `
        SELECT 
            SUBSTR(endDate, 1, 10) AS date, 
            SUM(CASE WHEN type = 'HKQuantityTypeIdentifierActiveEnergyBurned' THEN CAST(value AS FLOAT) ELSE 0 END) AS active, 
            SUM(CASE WHEN type = 'HKQuantityTypeIdentifierBasalEnergyBurned' THEN CAST(value AS FLOAT) ELSE 0 END) AS basal
        FROM 
            all_records
        WHERE 
            sourceName LIKE '%Watch%'
        GROUP BY 
            SUBSTR(endDate, 1, 10)`,
    insertSQL: `
        INSERT INTO energy (date, basal, active, total)
        VALUES (?, ?, ?, ?)`,
    formatRecord: (record) => [
        record.date,
        record.basal,
        record.active,
        record.basal + record.active,
    ],
};
exports.energyConfig = energyConfig;
const weightConfig = {
    tableName: "weight",
    createTableSQL: `
        CREATE TABLE IF NOT EXISTS weight (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            weight TEXT
        )`,
    querySQL: `
        SELECT 
            SUBSTR(endDate, 1, 10) AS date, 
            value AS weight
        FROM 
            all_records
        WHERE 
            type = 'HKQuantityTypeIdentifierBodyMass' 
            AND SUBSTR(creationDate, 1, 10) = '2024-04-08'
        GROUP BY 
            SUBSTR(endDate, 1, 10)`,
    insertSQL: `
        INSERT INTO weight (date, weight)
        VALUES (?, ?)`,
    formatRecord: (record) => [record.date, record.weight],
};
exports.weightConfig = weightConfig;
const sleepConfig = {
    tableName: "sleep",
    createTableSQL: `
        CREATE TABLE IF NOT EXISTS sleep (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            asleep_time TEXT,
            woke_time TEXT,
            total INT,
            deep INT,
            rem INT,
            core INT,
            awake INT
        )`,
    querySQL: `
        SELECT * 
        FROM all_records 
        WHERE type = 'HKCategoryTypeIdentifierSleepAnalysis' 
        AND sourceName LIKE '%Watch%' 
        ORDER BY startDate ASC`,
    insertSQL: `
        INSERT INTO sleep (date, asleep_time, woke_time, total, deep, rem, core, awake)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    formatRecord: (record) => [
        record.date,
        record.fellAsleepTime,
        record.wokeUpTime,
        record.total,
        record.deep,
        record.rem,
        record.core,
        record.awake,
    ],
};
exports.sleepConfig = sleepConfig;
