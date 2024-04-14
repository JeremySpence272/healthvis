const fs = require("fs");
const sax = require("sax");

let jsonFilePath = "../data/data.json";
let xmlFilePath = "../data/export.xml";

const writableStream = fs.createWriteStream(jsonFilePath, { flags: "a" });
const saxStream = sax.createStream(true);

let record = {}; // Temporary object to hold data for each record

saxStream.on("opentag", (node) => {
	if (node.name === "Record") {
		record = node.attributes; // Capture the attributes of the Record
	}
});

saxStream.on("closetag", (tagName) => {
	if (tagName === "Record") {
		// Convert the record to JSON and write it to the file
		writableStream.write(JSON.stringify(record) + "\n");
		record = {}; // Reset the record object for the next entry
	}
});

saxStream.on("error", (error) => {
	console.error("Error parsing XML:", error);
	this._parser.error = null; // Clear the error
});

saxStream.on("end", () => {
	console.log("XML parsing completed.");
	writableStream.end();
});

// Pipe the XML file through the SAX parser
fs.createReadStream(xmlFilePath).pipe(saxStream);
