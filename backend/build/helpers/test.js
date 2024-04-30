"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseXMLAndComputeStats = void 0;
const sax_1 = __importDefault(require("sax"));
const fs_1 = __importDefault(require("fs"));
const parseXMLAndComputeStats = (xmlPath) => {
    return new Promise((resolve, reject) => {
        const saxStream = sax_1.default.createStream(true, { trim: true });
        const results = {};
        let currentRecord = null;
        saxStream.on("opentag", (node) => {
            if (node.name === "Record" &&
                (node.attributes.type === "HKQuantityTypeIdentifierHeartRate" ||
                    node.attributes.type ===
                        "HKQuantityTypeIdentifierRestingHeartRate") &&
                node.attributes.sourceName.includes("Watch")) {
                const date = node.attributes.creationDate.substring(0, 10);
                const value = parseFloat(node.attributes.value);
                if (!results[date]) {
                    results[date] = {
                        sum: 0,
                        count: 0,
                        minimum: value,
                        maximum: value,
                        average: 0,
                    };
                }
                results[date].sum += value;
                results[date].count += 1;
                results[date].minimum = Math.min(results[date].minimum, value);
                results[date].maximum = Math.max(results[date].maximum, value);
            }
        });
        saxStream.on("closetag", (tagName) => {
            if (tagName === "Record" && currentRecord) {
                // Final calculations per record could be placed here if needed
            }
        });
        saxStream.on("end", () => {
            // Finalize averages
            Object.keys(results).forEach((date) => {
                if (results[date].count > 0) {
                    results[date].average = results[date].sum / results[date].count;
                }
            });
            console.log("XML parsing and computation completed.");
            resolve(results);
        });
        saxStream.on("error", (error) => {
            console.error("Error during XML parsing:", error);
            reject(error);
        });
        fs_1.default.createReadStream(xmlPath).pipe(saxStream);
    });
};
exports.parseXMLAndComputeStats = parseXMLAndComputeStats;
// Usage example
