export type DataPoint = {
	date: string;
	[key: string]: string | number | null;
};

export type ControlsType = {
	interval: IntervalOptions;
	startDate?: Date;
	endDate?: Date;
	dataType?: string;
	comparing: boolean;
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
	energy: ["total", "active", "basal"],
	heart: ["max", "min", "avg", "restingAvg"],
};

export enum ChartType {
	weight = "weight",
	sleep = "sleep",
	energy = "energy",
	heart = "heart",
}

export enum ChartUnits {
	weight = "lbs",
	sleep = "minutes",
}
