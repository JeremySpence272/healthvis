import ChartElement from "./ChartElement";
import { useEffect, useState } from "react";
import { ControlsType, dataTypeOptions, ChartType } from "./types";
import Controls from "./Controls";
import useFetchData from "./useFetchData";

interface DashboardProps {
	chartType: ChartType;
}

const Dashboard: React.FC<DashboardProps> = ({ chartType }) => {
	const [controls, setControls] = useState<ControlsType>({ interval: "daily" });
	const { data, isPending, error } = useFetchData({ chartType, controls });

	// probably need to update this later. this is a way of giving the dataType property of the controls an initial value when chartType is changed
	// this also has the effect of whenever the chartType is changed auto updating controls which will trigger the useFetchData hook
	useEffect(() => {
		setControls((prev) => ({
			...prev,
			dataType: dataTypeOptions[chartType]
				? dataTypeOptions[chartType][0]
				: undefined,
		}));
	}, [chartType]);

	function getLabels(): string[] {
		if (!data) return [];
		return data.map((data) => data.date);
	}

	const getData = (): number[] => {
		if (!data) return [];
		return data.map((data) => data.plot);
	};

	const handleControlChange = (controls: ControlsType): void => {
		setControls(controls);
	};

	if (error) return <div>Error loading data.</div>;
	if (isPending) return <div>Loading...</div>;

	return (
		<>
			<ChartElement labels={getLabels()} dataset={getData()} />
			<Controls
				chartType={chartType}
				currentControls={controls}
				handleControlChange={handleControlChange}
			/>
		</>
	);
};

export default Dashboard;
