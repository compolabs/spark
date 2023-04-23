import { useEffect, useRef } from "react";
import {
  widget,
  ChartingLibraryWidgetOptions,
  LanguageCode,
  ResolutionString,
} from "@src/charting_library";
import * as React from "react";
import { observer } from "mobx-react-lite";
import { useTradeVM } from "@screens/Trade/TradeVm";
import { BACKEND_URL } from "@src/constants";

export interface ChartContainerProps {
  symbol: ChartingLibraryWidgetOptions["symbol"];
  interval: ChartingLibraryWidgetOptions["interval"];

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
  return results === null
    ? null
    : (decodeURIComponent(results[1].replace(/\+/g, " ")) as LanguageCode);
};

const TVChartContainer = () => {
  const vm = useTradeVM();
  const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;

  const defaultProps: Omit<ChartContainerProps, "container"> = {
    symbol: `${vm.token0.symbol}/${vm.token1.symbol}`,
    interval: "60" as ResolutionString,
    datafeedUrl: BACKEND_URL,
    libraryPath: "/charting_library/",
    chartsStorageUrl: "https://saveload.tradingview.com",
    chartsStorageApiVersion: "1.1",
    clientId: "tradingview.com",
    userId: "public_user_id",
    fullscreen: false,
    autosize: true,
    studiesOverrides: {},
    overrides: {
      "paneProperties.background": "#222936",
      "paneProperties.backgroundType": "solid",
      "scalesProperties.lineColor": "#878FA0",
      "scalesProperties.textColor": "#878FA0",
    },
    custom_css_url: "src/screens/Trade/Chart/tw-styles.css",
  };
  const { location } = window;
  useEffect(() => {
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: defaultProps.symbol as string,
      // BEWARE: no trailing slash is expected in feed URL
      // tslint:disable-next-line:no-any
      datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(defaultProps.datafeedUrl),
      interval: defaultProps.interval as ChartingLibraryWidgetOptions["interval"],
      container: chartContainerRef.current,
      library_path: defaultProps.libraryPath as string,

      locale: getLanguageFromURL() || "en",
      disabled_features: ["use_localstorage_for_settings"],
      enabled_features: ["study_templates"],
      charts_storage_url: defaultProps.chartsStorageUrl,
      charts_storage_api_version: defaultProps.chartsStorageApiVersion,
      client_id: defaultProps.clientId,
      user_id: defaultProps.userId,
      fullscreen: defaultProps.fullscreen,
      autosize: defaultProps.autosize,
      studies_overrides: defaultProps.studiesOverrides,
      overrides: defaultProps.overrides,
      theme: "Dark",
      custom_css_url: `${location.origin}/tw-chart-styles.css`,
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
