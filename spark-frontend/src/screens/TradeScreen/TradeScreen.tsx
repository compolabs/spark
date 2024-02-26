import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react";

import { Column } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import sparkLogoIcon from "@src/assets/icons/sparkLogoIcon.svg";
import { useMedia } from "@src/hooks/useMedia";
import { CreateOrderSpotVMProvider } from "@src/screens/TradeScreen/LeftBlock/CreateOrderSpot/CreateOrderSpotVM";
import { useStores } from "@stores";

import TradeScreenDesktop from "./TradeScreenDesktop";
import TradeScreenMobile from "./TradeScreenMobile";

interface IProps {}

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Создание стилизованного компонента изображения с анимацией вращения
const LoaderLogoImage = styled.img`
  animation: ${rotate} 4s linear infinite; // 2 секунды для полного оборота, бесконечное повторение
`;
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
  if (tradeStore.spotMarkets.length === 0)
    return (
      <Column alignItems="center" justifyContent="center" mainAxisSize="stretch">
        <LoaderLogoImage alt="loader" height={64} src={sparkLogoIcon} width={64} />
        <SizedBox height={8} />
        <Text primary>Loading</Text>
      </Column>
    );
  tradeStore.setMarketSymbol(!marketId || !spotMarketExists ? tradeStore.defaultMarketSymbol : marketId);
  //
  return (
    //я оборачиваю весь TradeScreenImpl в CreateOrderSpotVMProvider потому что при нажатии на трейд в OrderbookAndTradesInterface должно меняться значение в LeftBlock
    <CreateOrderSpotVMProvider>
      <TradeScreenImpl />
    </CreateOrderSpotVMProvider>
  );
});

export default TradeScreen;
