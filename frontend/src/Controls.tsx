import { useEffect, useState } from "react";
import { ControlsType, IntervalOptions, dataTypeOptions } from "./types";
import { DateRangePickerValue, Select, SelectItem } from "@tremor/react";
import { DateRangePicker } from "@tremor/react";

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
				id="dateRange"
				enableSelect={true}
				onValueChange={handleDateUpdate}
				value={{ from: localControls.startDate, to: localControls.endDate }}
			/>
		</>
	);
};

export default Controls;
