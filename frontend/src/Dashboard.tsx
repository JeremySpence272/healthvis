import { useEffect, useState } from "react";
import { ControlsType, dataTypeOptions, ChartType } from "./types";
import Controls from "./Controls";
import useFetchData from "./useFetchData";
import ChartComponent from "./ChartComponent";

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

	const handleControlChange = (controls: ControlsType): void => {
		setControls(controls);
	};

	if (error) return <div>Error loading data.</div>;
	if (isPending) return <div>Loading...</div>;

	return (
		<>
			{data && (
				<section className="rounded bg-slate-200 w-1/2 mx-auto p-8 flex flex-col">
					<ChartComponent dataset={data} />
					<Controls
						chartType={chartType}
						currentControls={controls}
						handleControlChange={handleControlChange}
					/>
				</section>
			)}
		</>
	);
};

export default Dashboard;
