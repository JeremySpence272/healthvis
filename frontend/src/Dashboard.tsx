import { useEffect, useState } from "react";
import {
	ControlsType,
	dataTypeOptions,
	ChartType,
	IntervalOptions,
} from "./types";
import Controls from "./Controls";
import useFetchData from "./useFetchData";
import ChartComponent from "./ChartComponent";

interface DashboardProps {
	chartType: ChartType;
}

const Dashboard: React.FC<DashboardProps> = ({ chartType }) => {
	const [controls, setControls] = useState<ControlsType>({
		interval: IntervalOptions.daily,
		comparing: false,
	});
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
		console.log("===CONTROLS CHANGED===");
		setControls(controls);
	};

	if (error) return <div>Error loading data.</div>;
	if (isPending) return <div>Loading...</div>;

	return (
		<>
			{data ? (
				<div className="w-2/3 flex flex-row gap-10 mx-auto">
					<section className="rounded bg-slate-200 flex-grow p-8">
						{data.length > 0 ? (
							<ChartComponent dataset={data} />
						) : (
							<p className="text-center mx-auto text-xl text-red-600">
								No Data To Show...
							</p>
						)}
					</section>
					<section className="rounded bg-slate-200 w-1/3 p-8">
						<Controls
							chartType={chartType}
							currentControls={controls}
							handleControlChange={handleControlChange}
						/>
					</section>
				</div>
			) : (
				<p className="text-center mx-auto text-xl text-red-600">
					Huh what happened ????
				</p>
			)}
		</>
	);
};

export default Dashboard;
