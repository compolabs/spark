import React, { useEffect, useRef } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { useStores } from "@stores";

let tvScriptLoadingPromise: Promise<any>;

const TradingViewWidget = observer(() => {
  const onLoadScriptRef = useRef();

  const theme = useTheme();
  const { tradeStore } = useStores();

  useEffect(() => {
    (onLoadScriptRef as any).current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.id = "tradingview-widget-loading-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.onload = resolve;

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => onLoadScriptRef.current && (onLoadScriptRef as any).current());

    return () => {
      (onLoadScriptRef as any).current = null;
    };

    function createWidget() {
      if (tradeStore.market !== undefined && document.getElementById("tradingview_3f939") && "TradingView" in window) {
        new (window as any).TradingView.widget({
          autosize: true,
          // symbol: "OKX:BTCUSDC",
          symbol: `OKX:${tradeStore.market.baseToken.symbol}${tradeStore.market.quoteToken.symbol}`,
          interval: "30",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          enable_publishing: false,
          backgroundColor: theme.colors.bgPrimary,
          gridColor: theme.colors.borderSecondary,
          hide_top_toolbar: true,
          hide_legend: false,
          save_image: false,
          container_id: "tradingview_3f939",
        });
      }
    }
  }, [theme, tradeStore.market]);

  return (
    <Root className="tradingview-widget-container">
      <div id="tradingview_3f939" />
    </Root>
  );
});

export default TradingViewWidget;

const Root = styled.div`
  height: 100%;
  width: 100%;
  overflow: hidden;

  & > div {
    margin: -2px 0 0 -2px;
    height: calc(100% + 4px);
    width: calc(100% + 4px);
  }
`;
