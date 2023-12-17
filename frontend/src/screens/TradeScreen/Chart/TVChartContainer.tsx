import { useEffect, useRef } from "react";
import * as React from "react";
import { ChartingLibraryWidgetOptions, LanguageCode, ResolutionString, widget } from "@src/charting_library";
import { observer } from "mobx-react-lite";
import { useSpotTradeScreenVM } from "@screens/TradeScreen/SpotTradeVm";
import { CHARTS_STORAGE, TV_DATAFEED } from "@src/constants";
import { useTheme } from "@emotion/react";

export interface ChartContainerProps {
	symbol: ChartingLibraryWidgetOptions["symbol"];
	interval: ChartingLibraryWidgetOptions["interval"];
	timeframe: ChartingLibraryWidgetOptions["timeframe"];

	// BEWARE: no trailing slash is expected in feed URL
	datafeedUrl: string;
	libraryPath: ChartingLibraryWidgetOptions["library_path"];
	chartsStorageUrl: ChartingLibraryWidgetOptions["charts_storage_url"];
	chartsStorageApiVersion: ChartingLibraryWidgetOptions["charts_storage_api_version"];
	clientId: ChartingLibraryWidgetOptions["client_id"];
	userId: ChartingLibraryWidgetOptions["user_id"];
	fullscreen: ChartingLibraryWidgetOptions["fullscreen"];
	autosize: ChartingLibraryWidgetOptions["autosize"];
	studiesOverrides: ChartingLibraryWidgetOptions["studies_overrides"];
	overrides: ChartingLibraryWidgetOptions["overrides"];
	container: ChartingLibraryWidgetOptions["container"];
	custom_css_url: ChartingLibraryWidgetOptions["custom_css_url"];
}

const getLanguageFromURL = (): LanguageCode | null => {
	const regex = new RegExp("[\\?&]lang=([^&#]*)");
	const results = regex.exec(window.location.search);
	return results === null ? null : (decodeURIComponent(results[1].replace(/\+/g, " ")) as LanguageCode);
};

const TVChartContainer = () => {
	const vm = useSpotTradeScreenVM();
	const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
	const theme = useTheme();
	const defaultProps: Omit<ChartContainerProps, "container"> = {
		symbol: `${vm.token0.symbol}/${vm.token1.symbol}`,
		interval: "30" as ResolutionString,
		timeframe: "1D" as ResolutionString,
		datafeedUrl: TV_DATAFEED,
		libraryPath: "/charting_library/",
		chartsStorageUrl: CHARTS_STORAGE,
		chartsStorageApiVersion: "1.1",
		clientId: "tradingview.com",
		userId: "public_user_id",
		fullscreen: false,
		autosize: true,
		studiesOverrides: {},
		overrides: {
			"paneProperties.background": theme.colors.bgSecondary,
			"paneProperties.backgroundType": "solid",
			// "scalesProperties.lineColor": theme.colors.gray3,
			"scalesProperties.textColor": theme.colors.bgSecondary,
			"paneProperties.legendProperties.showSeriesOHLC": false,
			"mainSeriesProperties.candleStyle.upColor": theme.colors.greenLight,
			"mainSeriesProperties.candleStyle.downColor": theme.colors.redLight,
		},
		custom_css_url: "src/screens/Trade/Chart/tw-styles.css",
	};
	// const { location } = window;
	useEffect(() => {
		const widgetOptions: ChartingLibraryWidgetOptions = {
			symbol: defaultProps.symbol as string,
			// BEWARE: no trailing slash is expected in feed URL
			// tslint:disable-next-line:no-any
			datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(defaultProps.datafeedUrl),
			interval: defaultProps.interval as ChartingLibraryWidgetOptions["interval"],
			timeframe: defaultProps.timeframe,
			container: chartContainerRef.current,
			library_path: defaultProps.libraryPath as string,

			locale: getLanguageFromURL() || "en",
			disabled_features: [
				"symbol_info",
				"use_localstorage_for_settings",
				"header_widget",
				"header_symbol_search",
				"symbol_search_hot_key",
				"header_resolutions",
				"header_settings",
				"header_indicators",
				"header_compare",
				"header_screenshot",
				"header_fullscreen_button",
				"left_toolbar",
				"control_bar",
				"timeframes_toolbar",
			],
			enabled_features: ["study_templates"],
			// charts_storage_url: defaultProps.chartsStorageUrl,
			charts_storage_api_version: defaultProps.chartsStorageApiVersion,
			client_id: defaultProps.clientId,
			user_id: defaultProps.userId,
			fullscreen: defaultProps.fullscreen,
			autosize: defaultProps.autosize,
			studies_overrides: defaultProps.studiesOverrides,
			overrides: defaultProps.overrides,
			theme: "dark",
			// custom_css_url: `${location.origin}/tw-chart-styles.css`,
		};
		const tvWidget = new widget(widgetOptions);
		// tvWidget.onChartReady(() => {
		//   tvWidget.headerReady().then(() => {
		//     const button = tvWidget.createButton();
		//     button.setAttribute("title", "Click to show a notification popup");
		//     button.classList.add("apply-common-tooltip");
		//     button.addEventListener("click", () =>
		//       tvWidget.showNoticeDialog({
		//         title: "Notification",
		//         body: "Press and hold ⌘ while zooming to maintain the chart position",
		//         callback: () => {
		//           console.log("Noticed!");
		//         },
		//       })
		//     );
		//     button.innerHTML = "Check API";
		//   });
		// });

		return () => {
			tvWidget.remove();
		};
	});

	return <div ref={chartContainerRef} className={"TVChartContainer"} />;
};

export default observer(TVChartContainer);
