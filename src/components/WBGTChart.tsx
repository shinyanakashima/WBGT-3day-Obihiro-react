import {
	Chart as ChartJS,
	BarElement,
	CategoryScale,
	LinearScale,
	Tooltip,
	Legend,
	ChartOptions,
	ChartData,
	ChartTypeRegistry,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, annotationPlugin);

function formatDate(dateString: string): [string, string, string] {
	const year = dateString.slice(0, 4);
	const month = dateString.slice(4, 6).replace(/^0/, "");
	const day = dateString.slice(6, 8).replace(/^0/, "");
	return [year, month, day];
}

function getResponsiveFontSize(): number {
	let baseFontSize = 32;
	if (window.innerWidth >= 7680) baseFontSize = 40; // 7680×4320 (8K UHD), 超大型モニター
	else if (window.innerWidth >= 3840) baseFontSize = 38; // 3840×2160 (4K UHD), 大型モニター
	else if (window.innerWidth >= 2560) baseFontSize = 36; // 2560×1440 (WQHD), 大型モニター
	else if (window.innerWidth >= 1920) baseFontSize = 32; // 1920×1080 (FHD), 32型tv, 1920×1200(一般モニター比率16:10)

	return baseFontSize * (window.devicePixelRatio || 1); // 高DPI対応も加味
}

const CHITEN_URL = "https://6ealbffjxfgzo4r3kuiac7txry0bnwbm.lambda-url.us-east-1.on.aws/";

export const WBGTChart = () => {
	const [chartData, setChartData] = useState<ChartData<"bar">>({
		labels: [],
		datasets: [],
	});

	const [chartOptions, setChartOptions] = useState<ChartOptions<"bar">>({});

	useEffect(() => {
		fetch(CHITEN_URL, { mode: "cors" })
			.then((res) => res.json())
			.then((data) => {
				const timesPerDay = ["09", "12", "15", "18"];
				const times: string[] = [];
				const values: number[] = [];

				Object.entries(data).forEach(([_, value]: [string, any]) => {
					timesPerDay.forEach((h) => {
						times.push(h.replace(/^0/, ""));
						values.push(h in value ? value[h] : 0);
					});
				});

				const datasetLabel = (() => {
					const dateList = Object.keys(data);
					return [dateList[0], dateList[2]]
						.map((d) => {
							const [, m, d1] = formatDate(d);
							return `${m}/${d1}`;
						})
						.join("～");
				})();

				const RESPONSIVE_FONT_SIZE = getResponsiveFontSize();
				console.log("Responsive font size:", RESPONSIVE_FONT_SIZE);

				setChartData({
					labels: times,
					datasets: [
						{
							label: datasetLabel,
							data: values,
							backgroundColor: values.map((v) =>
								v > 28 ? "#FF6384" : "oklch(0.75 0.23 120)"
							),
						},
					],
				});

				setChartOptions({
					responsive: true,
					plugins: {
						legend: {
							display: false,
							labels: {
								font: { size: RESPONSIVE_FONT_SIZE },
							},
						},
						annotation: {
							annotations: {
								level_2: {
									type: "line",
									yMin: 21,
									yMax: 21,
									borderColor: "#a0d2ff",
									borderWidth: 5,
									label: {
										display: true,
										content: "注意(21℃)",
										position: "end",
										font: { size: RESPONSIVE_FONT_SIZE },
										backgroundColor: "#a0d2ff",
										color: "black",
										padding: 10,
									},
								},
								level_3: {
									type: "line",
									yMin: 25,
									yMax: 25,
									borderColor: "#F9E79F",
									borderWidth: 10,
									label: {
										display: true,
										content: "警戒(25℃)",
										position: "end",
										font: { size: RESPONSIVE_FONT_SIZE },
										backgroundColor: "#F9E79F",
										color: "black",
										padding: 10,
									},
								},
								level_4: {
									type: "line",
									yMin: 28,
									yMax: 28,
									borderColor: "#FF8A65",
									borderWidth: 10,
									label: {
										display: true,
										content: "厳重警戒(28℃)",
										position: "end",
										font: { size: RESPONSIVE_FONT_SIZE },
										backgroundColor: "#FF8A65",
										color: "black",
										padding: 10,
									},
								},
								level_5: {
									type: "line",
									yMin: 31,
									yMax: 31,
									borderColor: "#EF5350",
									borderWidth: 10,
									label: {
										display: true,
										content: "危険(31℃)",
										position: "end",
										font: { size: RESPONSIVE_FONT_SIZE },
										backgroundColor: "#EF5350",
										padding: 10,
									},
								},
								timeline_today: {
									type: "box",
									drawTime: "beforeDraw",
									xMin: -0.5,
									xMax: 3.5,
									backgroundColor: "#FFFFFF",
									borderWidth: 0,
									label: {
										display: true,
										content: "今日",
										position: { x: "center", y: "start" },
										font: { size: 60 },
										yAdjust: 15,
									},
								},
								timeline_tomorrow: {
									type: "box",
									drawTime: "beforeDraw",
									xMin: 3.5,
									xMax: 7.5,
									backgroundColor: "#F6F5F2",
									borderWidth: 0,
									label: {
										display: true,
										content: "明日",
										position: { x: "center", y: "start" },
										font: { size: 60 },
										yAdjust: 15,
									},
								},
								timeline_datomorrow: {
									type: "box",
									drawTime: "beforeDraw",
									xMin: 7.5,
									xMax: 11.5,
									backgroundColor: "#F0EBE3",
									borderWidth: 0,
									label: {
										display: true,
										content: "明後日",
										position: { x: "center", y: "start" },
										font: { size: 60 },
										yAdjust: 15,
									},
								},
							},
						},
					},
					scales: {
						x: {
							title: {
								display: true,
								text: "時間",
								font: { size: 35 },
								padding: { top: 2 },
							},
							ticks: {
								font: { size: RESPONSIVE_FONT_SIZE },
							},
						},
						y: {
							min: 15,
							suggestedMax: 35,
							title: {
								display: true,
								text: "WBGT(暑さ指数)",
								font: { size: 35 },
								padding: { top: 20 },
							},
							ticks: {
								font: { size: RESPONSIVE_FONT_SIZE },
							},
						},
					},
				});
			});
	}, []);

	return (
		<div className='pt-1 w-[95%] mx-auto'>
			<h1 className='pt-1 pb-1 text-[4em] xl:text-[3em] 2xl:text-[4em] text-center'>
				3日間の熱中症予測
			</h1>
			<Bar data={chartData} options={chartOptions} />
		</div>
	);
};
