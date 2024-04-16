import { useState } from "react";
import Dashboard from "./Dashboard";
import { ChartType } from "./types";

const App: React.FC = () => {
	const chartOptions = [ChartType.weight, ChartType.sleep];

	const [chartType, setChartType] = useState<ChartType>(ChartType.weight);

	const changeChartType = (): void => {
		setChartType(
			chartOptions[(chartOptions.indexOf(chartType) + 1) % chartOptions.length]
		);
	};
	return (
		<main className="bg-slate-950 min-h-screen">
			<h1 className="text-white text-5xl text-center py-16">
				Displaying
				<button
					className="py-2 px-2 m-2 bg-slate-200 text-slate-800 underline rounded hover:bg-slate-100"
					onClick={() => changeChartType()}
				>
					{chartType}
				</button>
				Chart
			</h1>
			<Dashboard chartType={chartType} />
		</main>
	);
};

export default App;
