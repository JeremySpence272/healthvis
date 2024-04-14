import moment, { Moment } from "moment";

type SleepRecord = {
	startDate: string;
	endDate: string;
	value: string;
};

type Night = {
	date: string;
	fellAsleepTime: Moment | string;
	wokeUpTime: Moment | string | null;
	deep: number;
	rem: number;
	core: number;
	awake: number;
	total: number;
};

const formatMoment = (date: Moment): string =>
	date.format("YYYY-MM-DD HH:mm:ss Z");

const formatFinalizednight = (
	currentNight: Night,
	previousRecordEndDate: Moment
): Night => {
	// we need to format our current moment and push to nights arr

	// format moment objects back to strings & get timeElapsed
	const formattedFellAsleepTime = moment.isMoment(currentNight.fellAsleepTime)
		? formatMoment(currentNight.fellAsleepTime)
		: currentNight.fellAsleepTime;

	return {
		...currentNight,
		fellAsleepTime: formattedFellAsleepTime,
		wokeUpTime: formatMoment(previousRecordEndDate),
		total: moment.isMoment(currentNight.fellAsleepTime)
			? previousRecordEndDate.diff(currentNight.fellAsleepTime, "minutes")
			: 0,
	};
};

const getNights = (records: SleepRecord[]): Night[] => {
	let nights: Night[] = []; // Array to hold each night's sleep data
	let currentNight: Night | null = null; // Object to track the current night's sleep session
	let previousRecordEndDate: Moment | null = null; // Track the end date of the last record processed

	records.forEach((record: any, index: number) => {
		if (record.value !== "HKCategoryValueSleepAnalysisInBed") {
			const startDate: Moment = moment(
				record.startDate,
				"YYYY-MM-DD HH:mm:ss Z"
			);
			const endDate: Moment = moment(record.endDate, "YYYY-MM-DD HH:mm:ss Z");

			const startNewNight: Boolean =
				!previousRecordEndDate ||
				startDate.diff(previousRecordEndDate, "minutes") > 10; // either this is the first record or there was a lapse greater than 10 mins (always means new night 10mins is arbitrary)

			if (startNewNight) {
				if (currentNight && previousRecordEndDate) {
					//should run everytime the startNewNight condition is true except with the first night
					nights.push(
						formatFinalizednight(currentNight, previousRecordEndDate)
					);
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
