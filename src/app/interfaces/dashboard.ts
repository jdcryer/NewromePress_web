import {
	ApexAxisChartSeries,
	ApexChart,
	ApexXAxis,
	ApexMarkers,
	ApexStroke,
	ApexYAxis,
	ApexDataLabels,
	ApexLegend,
	ApexFill,
	ApexTooltip,
	ApexTitleSubtitle
} from "ng-apexcharts";

export type IChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	xaxis: ApexXAxis;
	markers?: ApexMarkers;
	stroke?: ApexStroke;
	yaxis: ApexYAxis | ApexYAxis[];
	dataLabels: ApexDataLabels;
	legend: ApexLegend;
	fill?: ApexFill;
	tooltip: ApexTooltip;
	title: ApexTitleSubtitle;
	subtitle: ApexTitleSubtitle;
};
