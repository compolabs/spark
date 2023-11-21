import styled from "@emotion/styled";
import React, { HTMLAttributes, useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import SizedBox from "@components/SizedBox";
import { useTradeScreenVM } from "@screens/TradeScreen/TradeScreenVm";
import BN from "@src/utils/BN";
import { useStores } from "@stores";
import { Column, Row } from "@src/components/Flex";
import Text, { TEXT_TYPES } from "@components/Text";
import { css, useTheme } from "@emotion/react";
import useEventListener from "@src/utils/useEventListener";
import hexToRgba from "@src/utils/hexToRgb";
import Select from "@components/Select";
import sell from "@src/assets/icons/sellOrderBookIcon.svg";
import buy from "@src/assets/icons/buyOrderBookIcon.svg";
import sellAndBuy from "@src/assets/icons/buyAndSellOrderBookIcon.svg";
import useWindowSize from "@src/hooks/useWindowSize";

interface IProps extends HTMLAttributes<HTMLDivElement> {}

const Root = styled(Column)`
	grid-area: orderbook;
	width: 100%;
`;

const SettingsContainder = styled(Row)`
	justify-content: space-between;
	align-items: center;
	width: 100%;
	padding: 0 12px;
	box-sizing: border-box;

	& > * {
		margin-right: 8px;
	}

	& > :last-child {
		margin-right: 0;
	}
`;

const SettingIcon = styled.img<{ selected?: boolean }>`
	cursor: pointer;
	box-sizing: border-box;
	transition: 0.4s;
	border-radius: 4px;
	border: 1px solid ${({ selected, theme }) => (selected ? theme.colors.borderAccent : "transparent")};

	&:hover {
		border: 1px solid ${({ selected, theme }) => (selected ? theme.colors.borderAccent : theme.colors.borderPrimary)};
	}
`;

const desktopOnlyTotalValueStyle = css`
	.desktopOnly {
		display: none;
	}

	@media (min-width: 880px) {
		& > .desktopOnly {
			display: block;
		}
	}
`;

const OrderBookHeader = styled.div<{}>`
	width: 100%;
	box-sizing: border-box;
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	padding: 0 12px;
	text-align: center;

	@media (min-width: 880px) {
		grid-template-columns: repeat(3, 1fr);
	}

	& > * {
		text-align: start;
	}

	& > :last-of-type {
		text-align: end;
	}

	${desktopOnlyTotalValueStyle}
`;
const OrderRow = styled(Row)<{
	type: "buy" | "sell";
	fulfillPercent?: number;
	volumePercent?: number;
}>`
	position: relative;
	cursor: pointer;
	margin-bottom: 1px;
	height: 16px;
	width: 100%;
	justify-content: space-between;
	align-items: center;
	padding: 0 12px;
	box-sizing: border-box;
	background: transparent;
	transition: 0.4s;

	&:hover {
		background: ${({ type, theme }) =>
			type === "buy" ? hexToRgba(theme.colors.greenLight, 0.1) : hexToRgba(theme.colors.redLight, 0.1)};
	}

	.progress-bar {
		z-index: 0;
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		background: ${({ type, theme }) =>
			type === "buy" ? hexToRgba(theme.colors.greenLight, 0.1) : hexToRgba(theme.colors.redLight, 0.1)};
		transition: all 0.3s;
		width: ${({ fulfillPercent }) => (fulfillPercent != null ? `${fulfillPercent}%` : `0%`)};
	}

	.volume-bar {
		z-index: 0;
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		background: ${({ type, theme }) =>
			type === "buy" ? hexToRgba(theme.colors.greenLight, 0.3) : hexToRgba(theme.colors.redLight, 0.3)};
		transition: all 0.3s;
		width: ${({ volumePercent }) => (volumePercent != null ? `${volumePercent}%` : `0%`)};
	}

	& > div:last-of-type {
		text-align: right;
	}

	& > div {
		flex: 1;
		text-align: left;
		z-index: 1;
	}

	${desktopOnlyTotalValueStyle}
`;
const Container = styled.div<{
	fitContent?: boolean;
	reverse?: boolean;
}>`
	display: flex;
	flex-direction: column;
	justify-content: center;
	width: 100%;
	${({ fitContent }) => !fitContent && "height: 100%;"};
	${({ reverse }) => reverse && "flex-direction: column-reverse;"};
	height: 100%;
`;

const SpreadRow = styled(Row)`
	padding-left: 12px;
	height: 24px;
	background: ${({ theme }) => theme.colors.bgPrimary};
	align-items: center;
`;

const DECIMAL_OPTIONS = [2, 4, 5, 6];

const OrderBook: React.FC<IProps> = observer(() => {
	const vm = useTradeScreenVM();
	const { ordersStore } = useStores();
	const { width: windowWidth } = useWindowSize();
	const theme = useTheme();
	const [decimalKey, setDecimalKey] = useState("0");
	const [orderFilter, setOrderFilter] = useState(0);
	const [amountOfOrders, setAmountOfOrders] = useState(20);
	const oneSizeOrders = +new BN(amountOfOrders).div(2).toFixed(0) - 1;

	// 48 + 50 + 4 + 26 + (12 + 32 + 8 + 16 + 24); //220
	// 48 + 50 + 4 + 26 + (12 + 32 + 8 + 32 + 8 + 16 + 24); //260
	const calcSize = () => {
		windowWidth != null && windowWidth > 880 && setAmountOfOrders(+new BN(window.innerHeight - 260).div(17).toFixed(0));
	};

	useEffect(calcSize, [windowWidth]);
	const handleResize = useCallback(calcSize, [windowWidth]);

	useEventListener("resize", handleResize);

	const buyOrders = ordersStore.orderbook.buy
		.slice()
		.sort((a, b) => {
			if (a.price == null && b.price == null) return 0;
			if (a.price == null && b.price != null) return 1;
			if (a.price == null && b.price == null) return -1;
			return a.price < b.price ? 1 : -1;
		})
		.reverse()
		.slice(orderFilter === 0 ? -oneSizeOrders : -amountOfOrders)
		.reverse();
	const sellOrders = ordersStore.orderbook.sell
		.slice()
		.sort((a, b) => {
			if (a.price == null && b.price == null) return 0;
			if (a.price == null && b.price != null) return 1;
			if (a.price == null && b.price == null) return -1;
			return a.price < b.price ? 1 : -1;
		})
		.slice(orderFilter === 0 ? -oneSizeOrders : -amountOfOrders);

	const totalBuy = buyOrders.reduce((acc, order) => acc.plus(order.amountLeft), BN.ZERO);
	const totalSell = sellOrders.reduce((acc, order) => acc.plus(order.amountLeft), BN.ZERO);

	if (ordersStore.orderbook.buy.length === 0 && ordersStore.orderbook.sell.length === 0)
		return (
			<Root alignItems="center" justifyContent="center" mainAxisSize="stretch">
				<Text type={TEXT_TYPES.SUPPORTING}>No orders yet</Text>
			</Root>
		);

	return (
		<Root>
			<SettingsContainder>
				<Select
					options={DECIMAL_OPTIONS.map((v, index) => ({
						title: `${v} decimals`,
						key: index.toString(),
					}))}
					selected={decimalKey}
					onSelect={({ key }) => setDecimalKey(key)}
				/>
				{[sellAndBuy, sell, buy].map((image, index) => (
					<SettingIcon
						key={index}
						src={image}
						alt="filter"
						selected={orderFilter === index}
						onClick={() => ordersStore.initialized && setOrderFilter(index)}
					/>
				))}
			</SettingsContainder>
			<SizedBox height={8} />
			<OrderBookHeader>
				<Text type={TEXT_TYPES.SUPPORTING}>Amount {vm.token0.symbol}</Text>
				<Text type={TEXT_TYPES.SUPPORTING} className="desktopOnly">
					Total {vm.token1.symbol}
				</Text>
				<Text type={TEXT_TYPES.SUPPORTING}>Price {vm.token1.symbol}</Text>
			</OrderBookHeader>
			<SizedBox height={8} />
			<Container fitContent={orderFilter === 1 || orderFilter === 2} reverse={orderFilter === 1}>
				{orderFilter === 0 && (
					<Plug length={sellOrders.length < +oneSizeOrders ? +oneSizeOrders - 1 - sellOrders.length : 0} />
				)}
				{orderFilter === 1 && (
					<Plug length={sellOrders.length < +amountOfOrders ? +amountOfOrders - 1 - sellOrders.length : 0} />
				)}

				{orderFilter !== 2 &&
					sellOrders.map((o, index) => (
						<OrderRow
							type="sell"
							fulfillPercent={+new BN(o.fullFillPercent).toFormat(2)}
							volumePercent={o.amountLeft.div(totalSell).times(100).toNumber()}
							key={index + "negative"}
							onClick={() => {
								const price = BN.parseUnits(o.price, vm.token1.decimals);
								vm.setIsSell(false);
								vm.setBuyPrice(price, true);
								// vm.setSellAmpount(new BN(o.amount), true);
								vm.setSellPrice(BN.ZERO, true);
								vm.setSellAmount(BN.ZERO, true);
								vm.setSellTotal(BN.ZERO, true);
							}}
						>
							<span className="progress-bar" />
							<span className="volume-bar" />
							<Text primary>{o.amountLeftStr}</Text>
							<Text primary className="desktopOnly">
								{o.totalLeftStr}
							</Text>
							<Text color={theme.colors.redLight}>{new BN(o.price).toFormat(DECIMAL_OPTIONS[+decimalKey])}</Text>
						</OrderRow>
					))}

				{orderFilter === 0 && (
					<SpreadRow>
						<Text type={TEXT_TYPES.SUPPORTING}>SPREAD</Text>
						<SizedBox width={12} />
						<Text primary>{ordersStore.spreadPrice}</Text>
						<SizedBox width={12} />
						<Text color={+ordersStore.spreadPercent > 0 ? theme.colors.greenLight : theme.colors.redLight}>
							{`(${+ordersStore.spreadPercent > 0 ? "+" : ""}${ordersStore.spreadPercent}%) `}
						</Text>
					</SpreadRow>
				)}

				{orderFilter !== 1 &&
					buyOrders.map((o, index) => (
						<OrderRow
							onClick={() => {
								const price = BN.parseUnits(o.price, vm.token1.decimals);
								vm.setIsSell(true);
								vm.setSellPrice(price, true);
								vm.setBuyPrice(BN.ZERO, true);
								vm.setBuyAmount(BN.ZERO, true);
								vm.setBuyTotal(BN.ZERO, true);
							}}
							fulfillPercent={+new BN(o.fullFillPercent).toFormat(0)}
							volumePercent={o.amountLeft.div(totalBuy).times(100).toNumber()}
							type="buy"
							key={index + "positive"}
						>
							<span className="progress-bar" />
							<span className="volume-bar" />
							<Text primary>{o.totalLeftStr}</Text>
							<Text primary className="desktopOnly">
								{o.amountLeftStr}
							</Text>
							<Text color={theme.colors.greenLight}>{new BN(o.price).toFormat(DECIMAL_OPTIONS[+decimalKey])}</Text>
						</OrderRow>
					))}

				{orderFilter === 2 && (
					<Plug length={buyOrders.length < +amountOfOrders ? +amountOfOrders - 1 - buyOrders.length : 0} />
				)}
				{orderFilter === 0 && (
					<Plug length={buyOrders.length < +oneSizeOrders ? +oneSizeOrders - 1 - buyOrders.length : 0} />
				)}
			</Container>
		</Root>
	);
});
export default OrderBook;

const PlugRow = styled(Row)`
	justify-content: space-between;
	margin-bottom: 1px;
	height: 16px;
	padding: 0 12px;
	box-sizing: border-box;
	${desktopOnlyTotalValueStyle}
`;

const Plug: React.FC<{
	length: number;
}> = ({ length }) => (
	<>
		{Array.from({ length }).map((_, index) => (
			<PlugRow key={index + "positive-plug"}>
				<Text>-</Text>
				<Text className="desktopOnly">-</Text>
				<Text>-</Text>
			</PlugRow>
		))}
	</>
);
