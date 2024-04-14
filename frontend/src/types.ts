export type Record = {
	date: string;
	plot: number;
};

export type ControlsType = {
	interval: "daily" | "weekly" | "monthly";
	dataType?: string;
};

type DataTypeOptions = {
	[category: string]: string[];
};

export const dataTypeOptions: DataTypeOptions = {
	sleep: ["total", "deep", "rem", "core", "awake"],
};

// change name of this
export enum ChartType {
	weight = "weight",
	sleep = "sleep",
}
