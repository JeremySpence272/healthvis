import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

interface WeightChartProps {
	labels: string[];
	dataset: number[];
}

const ChartElement: React.FC<WeightChartProps> = ({ labels, dataset }) => {
	const data = {
		labels,
		datasets: [
			{
				label: "Weight",
				data: dataset,
				borderColor: "rgb(255, 99, 132)",
				backgroundColor: "rgba(255, 99, 132, 0.5)",
			},
		],
	};

	const options = {
		maintainAspectRatio: false,
		scales: {
			y: {
				display: true,
				afterDataLimits: (axis: any) => {
					const padding = 0.3;
					const dataRange = axis.max - axis.min;
					const expandedRange = dataRange * padding;

					axis.max += expandedRange;
					axis.min -= expandedRange;
				},
			},
		},
	};
	return <Line options={options} width={"100%"} data={data} />;
};

export default ChartElement;
