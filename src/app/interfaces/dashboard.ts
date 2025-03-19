import {
	ApexAxisChartSeries,
	ApexChart,
	ApexFill,
	ApexTooltip,
	ApexXAxis,
	ApexLegend,
	ApexDataLabels,
	ApexTitleSubtitle,
	ApexYAxis,
	ApexMarkers,
	ApexStroke
} from "ng-apexcharts";

export type IChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	xaxis: ApexXAxis;
	markers?: ApexMarkers;
	stroke?: ApexStroke;
	yaxis: ApexYAxis | ApexYAxis[];
	dataLabels: ApexDataLabels;
	title: ApexTitleSubtitle;
	legend: ApexLegend;
	fill?: ApexFill;
	tooltip: ApexTooltip;
	subtitle: ApexTitleSubtitle;
};
