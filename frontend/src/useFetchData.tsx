import { useEffect, useState } from "react";
import { ChartType, ControlsType, DataPoint } from "./types";
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

	const queryURL = (): string => {
		const base = `${ENDPOINT}/${chartType}`;
		const params = new URLSearchParams();

		Object.entries(controls).forEach(([key, val]) => {
			if (val) {
				if (typeof val !== "string")
					params.append(key, val.toISOString().slice(0, 10));
				else params.append(key, val);
			}
		});
		return `${base}?${params.toString()}`;
	};

	useEffect(() => {
		const fetchData = async () => {
			console.log(`CURRENT QUERY URL = ${queryURL()}`);
			setIsPending(true);
			try {
				const response: AxiosResponse = await axios.get(queryURL());
				const records: DataPoint[] = response.data;
				setData(records);
				setIsPending(false);
			} catch (err) {
				setError(err as Error);
				console.error(err);
				setIsPending(false);
			}
		};

		fetchData();
	}, [controls]);

	return { data, isPending, error };
};

export default useFetchData;
