import { useEffect, useState } from "react";
import { ControlsType, dataTypeOptions } from "./types";

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

	const updateInterval = (e: React.ChangeEvent<HTMLSelectElement>): void => {
		setLocalControls({
			...localControls,
			interval: e.target.value as ControlsType["interval"],
		});
	};

	const updateDataType = (e: React.ChangeEvent<HTMLSelectElement>): void => {
		setLocalControls({
			...localControls,
			dataType: e.target.value as ControlsType["dataType"],
		});
		handleControlChange(localControls);
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
			}}
		>
			<select
				name="interval"
				value={localControls.interval}
				onChange={updateInterval}
			>
				<option value="daily">Daily</option>
				<option value="weekly">Weekly</option>
				<option value="monthly">Monthly</option>
			</select>
			{dataTypeOptions[chartType] && (
				<select
					name="dataType"
					value={localControls.dataType}
					onChange={updateDataType}
				>
					{dataTypeOptions[chartType].map((option) => (
						<option key={option} value={option}>
							{option.toUpperCase()}
						</option>
					))}
				</select>
			)}
		</form>
	);
};

export default Controls;
