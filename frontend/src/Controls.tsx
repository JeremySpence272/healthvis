import { useEffect, useState } from "react";
import { ControlsType, IntervalOptions, dataTypeOptions } from "./types";
import {
	DateRangePickerValue,
	Select,
	SelectItem,
	Switch,
} from "@tremor/react";
import { DateRangePicker, DateRangePickerItem } from "@tremor/react";

interface ControlsProps {
	chartType: string;
	currentControls: ControlsType;
	handleControlChange: (controls: ControlsType) => void;
}

const Controls: React.FC<ControlsProps> = ({
	chartType,
	currentControls,
	handleControlChange,
}) => {
	const [localControls, setLocalControls] =
		useState<ControlsType>(currentControls);

	useEffect(() => {
		handleControlChange(localControls);
	}, [localControls]);

	const handleIntervalUpdate = (val: string): void => {
		setLocalControls({
			...localControls,
			interval: IntervalOptions[val as keyof typeof IntervalOptions],
		});
	};
	const handleDataTypeUpdate = (val: string): void => {
		setLocalControls({
			...localControls,
			dataType: val,
		});
	};

	const handleDateUpdate = (val: DateRangePickerValue) => {
		const sDate = val.from!;
		const eDate = val.to!;
		setLocalControls({
			...localControls,
			startDate: sDate,
			endDate: eDate,
		});
	};

	const handleCompareSwitchChange = (val: boolean) => {
		setLocalControls({
			...localControls,
			comparing: val,
		});
	};

	const getFromDateHelper = (days: number): Date => {
		const d = new Date();
		const day = d.getDate() - days;
		d.setDate(day);

		return d;
	};

	return (
		<>
			<label htmlFor="interval" className="text-sm">
				Select Interval
			</label>
			<Select
				id="interval"
				value={localControls.interval}
				onValueChange={handleIntervalUpdate}
				className="mb-4 mt-1"
			>
				{(
					Object.keys(IntervalOptions) as Array<keyof typeof IntervalOptions>
				).map((key) => (
					<SelectItem key={key} value={key}>
						{key[0].toUpperCase() + key.slice(1)}
					</SelectItem>
				))}
			</Select>
			{localControls.dataType && dataTypeOptions[chartType] && (
				<>
					<label htmlFor="dataType" className="text-sm">
						Select Data Type
					</label>
					<Select
						id="dataType"
						value={localControls.dataType}
						onValueChange={handleDataTypeUpdate}
						className="mb-4 mt-1"
					>
						{dataTypeOptions[chartType].map((option) => (
							<SelectItem key={option} value={option}>
								{option[0].toUpperCase() + option.slice(1)}
							</SelectItem>
						))}
					</Select>
				</>
			)}
			<label htmlFor="dateRange" className="text-sm">
				Select Date Range
			</label>
			<DateRangePicker
				className="mb-4"
				id="dateRange"
				enableSelect={true}
				onValueChange={handleDateUpdate}
				value={{ from: localControls.startDate, to: localControls.endDate }}
				enableClear={true}
				enableYearNavigation={true}
				maxDate={new Date()}
			>
				<DateRangePickerItem
					key="7"
					value="Last Week"
					from={getFromDateHelper(7)}
				></DateRangePickerItem>
				<DateRangePickerItem
					key="30"
					value="Last Month"
					from={getFromDateHelper(30)}
				></DateRangePickerItem>
				<DateRangePickerItem
					key="90"
					value="Last 90 Days"
					from={getFromDateHelper(90)}
				></DateRangePickerItem>
				<DateRangePickerItem
					key="180"
					value="Last 6 Months"
					from={getFromDateHelper(180)}
				></DateRangePickerItem>
				<DateRangePickerItem
					key="365"
					value="Last Year"
					from={getFromDateHelper(365)}
				></DateRangePickerItem>
			</DateRangePicker>
			<label className="text-sm" htmlFor="comparing">
				Compare w previous date range
			</label>
			<Switch
				id="comparing"
				name="comparing"
				checked={localControls.comparing}
				onChange={handleCompareSwitchChange}
			/>
		</>
	);
};

export default Controls;
