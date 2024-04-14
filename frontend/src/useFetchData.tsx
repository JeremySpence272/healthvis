import { useEffect, useState } from "react";
import { ChartType, ControlsType, Record } from "./types";
import axios, { AxiosResponse } from "axios";

interface UseFetchDataProps {
	chartType: ChartType;
	controls: ControlsType;
}

type UseFetchDataResult = {
	data: Record[] | null;
	isPending: boolean;
	error: Error | null;
};

const mapToRecords = (data: any): Record => ({
	date: data.date,
	plot: Number(data.plot),
});

const ENDPOINT: string = "http://localhost:3000/data";

const useFetchData = ({
	chartType,
	controls,
}: UseFetchDataProps): UseFetchDataResult => {
	const [data, setData] = useState<Record[] | null>(null);
	const [isPending, setIsPending] = useState<boolean>(false);
	const [error, setError] = useState<Error | null>(null);

	const queryURL = (): string => {
		const base = `${ENDPOINT}/${chartType}`;
		const params = new URLSearchParams();

		Object.entries(controls).forEach(([key, val]) => {
			if (val) params.append(key, val);
		});
		return `${base}?${params.toString()}`;
	};

	useEffect(() => {
		const fetchData = async () => {
			console.log(`fetching ${chartType} data from api`);
			setIsPending(true);
			try {
				const response: AxiosResponse = await axios.get(queryURL());
				const records: Record[] = response.data.map(mapToRecords);
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
