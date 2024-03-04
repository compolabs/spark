import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { observer } from "mobx-react";

import Loader from "@src/components/Loader";
import { useMedia } from "@src/hooks/useMedia";
import { CreateOrderSpotVMProvider } from "@src/screens/TradeScreen/LeftBlock/CreateOrderSpot/CreateOrderSpotVM";
import { useStores } from "@stores";

import TradeScreenDesktop from "./TradeScreenDesktop";
import TradeScreenMobile from "./TradeScreenMobile";

interface IProps {}

const TradeScreenImpl: React.FC<IProps> = observer(() => {
  const { tradeStore } = useStores();
  const media = useMedia();

  useEffect(() => {
    document.title = `Spark | ${tradeStore.marketSymbol}`;
  }, [tradeStore.marketSymbol]);

  return media.mobile ? <TradeScreenMobile /> : <TradeScreenDesktop />;
});

const TradeScreen: React.FC<IProps> = observer(() => {
  const { tradeStore } = useStores();
  const { marketId } = useParams<{ marketId: string }>();
  const spotMarketExists = tradeStore.spotMarkets.some((market) => market.symbol === marketId);

  if (tradeStore.spotMarkets.length === 0) {
    return <Loader />;
  }

  tradeStore.setMarketSymbol(!marketId || !spotMarketExists ? tradeStore.defaultMarketSymbol : marketId);

  return (
    //я оборачиваю весь TradeScreenImpl в CreateOrderSpotVMProvider потому что при нажатии на трейд в OrderbookAndTradesInterface должно меняться значение в LeftBlock
    <CreateOrderSpotVMProvider>
      <TradeScreenImpl />
    </CreateOrderSpotVMProvider>
  );
});

export default TradeScreen;
