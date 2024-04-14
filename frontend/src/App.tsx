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
		<>
			<h1>
				Displaying
				<button
					style={{
						padding: "4px 10px",
						margin: "10px",
						backgroundColor: "#DFFF00",
						color: "#242424",
						textDecoration: "underline",
						borderRadius: "5px",
					}}
					onClick={() => changeChartType()}
				>
					{chartType}
				</button>
				Chart
			</h1>
			<Dashboard chartType={chartType} />
		</>
	);
};

export default App;
