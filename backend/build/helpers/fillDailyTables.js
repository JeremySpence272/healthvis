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
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
// const {
// 	heartConfig,
// 	sleepConfig,
// 	energyConfig,
// 	weightConfig,
// } = require("./dataConfigs");
const dataConfigs_1 = require("./dataConfigs");
const { getNights } = require("../utils/sleepUtils");
function processData(config) {
    return __awaiter(this, void 0, void 0, function* () {
        let db = null;
        let daily_db = null;
        try {
            db = yield (0, sqlite_1.open)({
                filename: "../../data/database.db",
                driver: sqlite3_1.default.Database,
            });
            daily_db = yield (0, sqlite_1.open)({
                filename: "../../data/daily.db",
                driver: sqlite3_1.default.Database,
            });
            yield daily_db.run(config.createTableSQL); // create new table if not exists
            let rows = yield db.all(config.querySQL); // read from all records
            if (config.tableName === "sleep") {
                // additional logic needed for sleep data
                rows = getNights(rows);
            }
            const insertPromises = rows.map((record) => daily_db
                .run(config.insertSQL, config.formatRecord(record))
                .then(() => { }) // push records to new database don't need to return anythign
            );
            yield Promise.all(insertPromises); // wait for records to be pushed
        }
        catch (err) {
            console.error(`err writing to table ${config.tableName}:`, err);
        }
        finally {
            if (db) {
                yield db.close(); // close when done
                yield (daily_db === null || daily_db === void 0 ? void 0 : daily_db.close());
            }
        }
    });
}
// can fill multiple tables
const fillTables = (configs) => __awaiter(void 0, void 0, void 0, function* () {
    for (const config of configs) {
        yield processData(config);
    }
});
fillTables([dataConfigs_1.heartConfig, dataConfigs_1.energyConfig, dataConfigs_1.weightConfig]);
//options are [heartConfig, sleepConfig, energyConfig, weightConfig]
