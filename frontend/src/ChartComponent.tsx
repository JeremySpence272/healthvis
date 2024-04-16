import { LineChart } from "@tremor/react";
import { DataPoint } from "./types";

interface ChartComponentProps {
	dataset: DataPoint[];
}

const ChartComponent: React.FC<ChartComponentProps> = ({
	dataset,
}: ChartComponentProps) => {
	const getLabels = (): string[] => {
		let labels: string[] = [];
		Object.keys(dataset[0]).forEach((key) => {
			if (key !== "date") labels.push(key);
		});
		return labels;
	};
	return (
		<LineChart
			className="h-80"
			data={dataset}
			index="date"
			categories={getLabels()}
			colors={["indigo", "red"]}
			yAxisWidth={40}
			autoMinValue={true}
		/>
	);
};

export default ChartComponent;
