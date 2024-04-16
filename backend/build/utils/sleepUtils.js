"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const formatMoment = (date) => date.format("YYYY-MM-DD HH:mm:ss Z");
const formatFinalizednight = (currentNight, previousRecordEndDate) => {
    // we need to format our current moment and push to nights arr
    // format moment objects back to strings & get timeElapsed
    const formattedFellAsleepTime = moment_1.default.isMoment(currentNight.fellAsleepTime)
        ? formatMoment(currentNight.fellAsleepTime)
        : currentNight.fellAsleepTime;
    return Object.assign(Object.assign({}, currentNight), { fellAsleepTime: formattedFellAsleepTime, wokeUpTime: formatMoment(previousRecordEndDate), total: moment_1.default.isMoment(currentNight.fellAsleepTime)
            ? previousRecordEndDate.diff(currentNight.fellAsleepTime, "minutes")
            : 0 });
};
const getNights = (records) => {
    let nights = []; // Array to hold each night's sleep data
    let currentNight = null; // Object to track the current night's sleep session
    let previousRecordEndDate = null; // Track the end date of the last record processed
    records.forEach((record, index) => {
        if (record.value !== "HKCategoryValueSleepAnalysisInBed") {
            const startDate = (0, moment_1.default)(record.startDate, "YYYY-MM-DD HH:mm:ss Z");
            const endDate = (0, moment_1.default)(record.endDate, "YYYY-MM-DD HH:mm:ss Z");
            const startNewNight = !previousRecordEndDate ||
                startDate.diff(previousRecordEndDate, "minutes") > 10; // either this is the first record or there was a lapse greater than 10 mins (always means new night 10mins is arbitrary)
            if (startNewNight) {
                if (currentNight && previousRecordEndDate) {
                    //should run everytime the startNewNight condition is true except with the first night
                    nights.push(formatFinalizednight(currentNight, previousRecordEndDate));
                }
                // setup a new night
                currentNight = {
                    date: startDate.format("YYYY-MM-DD"),
                    fellAsleepTime: startDate,
                    wokeUpTime: null, // This will be set when the night ends
                    deep: 0,
                    rem: 0,
                    core: 0,
                    awake: 0,
                    total: 0,
                };
            }
            // self explanatory... updates the time elapsed values of the current night based on ... time elapsed
            if (currentNight) {
                const elapsedMinutes = endDate.diff(startDate, "minutes");
                switch (record.value) {
                    case "HKCategoryValueSleepAnalysisAsleepDeep":
                        currentNight.deep += elapsedMinutes;
                        break;
                    case "HKCategoryValueSleepAnalysisAsleepCore":
                        currentNight.core += elapsedMinutes;
                        break;
                    case "HKCategoryValueSleepAnalysisAsleepREM":
                        currentNight.rem += elapsedMinutes;
                        break;
                    case "HKCategoryValueSleepAnalysisAwake":
                        currentNight.awake += elapsedMinutes;
                        break;
                }
            }
            // always update the previousRecordEndDate to the current record's endDate
            previousRecordEndDate = endDate;
            // if this is the last record, we need to close out the ongoing night
            if (index === records.length - 1 && currentNight) {
                formatFinalizednight(currentNight, previousRecordEndDate);
            }
        }
    });
    return nights;
};
module.exports = { getNights };
