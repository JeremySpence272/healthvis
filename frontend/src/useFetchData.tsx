import { useEffect, useState } from "react";
import { ChartType, ChartUnits, ControlsType, DataPoint } from "./types";
import axios, { AxiosResponse } from "axios";

interface UseFetchDataProps {
	chartType: ChartType;
	controls: ControlsType;
}

type UseFetchDataResult = {
	data: DataPoint[] | null;
	isPending: boolean;
	error: Error | null;
};

const ENDPOINT: string = "http://localhost:3000/data";

const useFetchData = ({
	chartType,
	controls,
}: UseFetchDataProps): UseFetchDataResult => {
	const [data, setData] = useState<DataPoint[] | null>(null);
	const [isPending, setIsPending] = useState<boolean>(false);
	const [error, setError] = useState<Error | null>(null);

	const queryURL = (isComparing: boolean): string => {
		const base = `${ENDPOINT}/${chartType}`;
		const params = new URLSearchParams();
		let period: number = 0;
		if (controls.startDate && controls.endDate) {
			period = controls.endDate.getTime() - controls.startDate.getTime();
		}
		Object.entries(controls).forEach(([key, val]) => {
			if (val) {
				if (val instanceof Date) {
					if (!isComparing) params.append(key, val.toISOString().slice(0, 10));
					else {
						const adjustedDate: Date = new Date(val.getTime() - period);
						params.append(key, adjustedDate.toISOString().slice(0, 10));
					}
				} else if (typeof val === "string") params.append(key, val);
			}
		});
		return `${base}?${params.toString()}`;
	};

	useEffect(() => {
		const fetchData = async () => {
			console.log(`CURRENT QUERY URL = ${queryURL(false)}`);
			setIsPending(true);
			try {
				const response: AxiosResponse = await axios.get(queryURL(false));
				const records: DataPoint[] = response.data;
				setData(records);
				if (controls.comparing && controls.startDate && controls.endDate) {
					fetchCompareData(records);
				}
				setIsPending(false);
			} catch (err) {
				setError(err as Error);
				console.error(err);
				setIsPending(false);
			} finally {
			}
		};

		const fetchCompareData = async (records: DataPoint[]) => {
			console.log(`CURRENT QUERY URL = ${queryURL(true)}`);
			setIsPending(true);
			try {
				const response: AxiosResponse = await axios.get(queryURL(true));
				const compareRecords: (DataPoint | null)[] = response.data;

				if (compareRecords.length !== records.length) {
					let diff = records.length - compareRecords.length;
					for (let i = 0; i < diff; i++) compareRecords.unshift(null);
				}

				const updatedData: DataPoint[] = records!.map((record, i) => {
					let compareRecord = null;
					if (compareRecords[i]) {
						compareRecord = compareRecords[i]![chartType];
					}
					return {
						...record,
						"compare": compareRecord,
					};
				});
				setData(updatedData);
				setIsPending(false);
			} catch (err) {
				setError(err as Error);
				console.error(err);
				setIsPending(false);
			} finally {
				console.log(data);
			}
		};

		fetchData();
	}, [controls]);

	return { data, isPending, error };
};

export default useFetchData;
