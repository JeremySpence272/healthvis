export type DataPoint = {
	date: string;
	[key: string]: string | number;
};

export type ControlsType = {
	interval: IntervalOptions;
	startDate?: Date;
	endDate?: Date;
	dataType?: string;
};

export enum IntervalOptions {
	daily = "daily",
	weekly = "weekly",
	monthly = "monthly",
}

type DataTypeOptions = {
	[category: string]: string[];
};

export const dataTypeOptions: DataTypeOptions = {
	sleep: ["total", "deep", "rem", "core", "awake"],
};

export enum ChartType {
	weight = "weight",
	sleep = "sleep",
}
