import styled from "@emotion/styled";
import React, { HTMLAttributes, useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import SizedBox from "@components/SizedBox";
import { useTradeScreenVM } from "@screens/TradeScreen/TradeScreenVm";
import BN from "@src/utils/BN";
import { useStores } from "@stores";
import Skeleton from "react-loading-skeleton";
import { Row } from "@src/components/Flex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { useTheme } from "@emotion/react";
import useEventListener from "@src/utils/useEventListener";

interface IProps extends HTMLAttributes<HTMLDivElement> {
	mobileMode?: boolean;
}

const Root = styled.div`
	display: flex;
	flex-direction: column;
	grid-area: orderbook;
	width: 100%;
`;
const Columns = styled.div<{ noHover?: boolean; percent?: number }>`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	${({ noHover }) => !noHover && "cursor: pointer;"};
	padding: 0 18px;
	text-align: center;

	p:last-of-type {
		text-align: end;
	}

	p:first-of-type {
		text-align: start;
	}

	:hover {
		${({ noHover }) => !noHover && "background:  #323846;"};
	}
`;
const OrderRow = styled(Row)<{ type: "buy" | "sell"; percent?: number }>`
	position: relative;
	cursor: pointer;
	margin-bottom: 1px;
	height: 18px;
	width: 100%;
	justify-content: space-between;
	align-items: center;
	padding: 0 18px;
	box-sizing: border-box;
	background: transparent;
	transition: 0.4s;

	&:hover {
		background: ${({ type }) => (type === "buy" ? "rgba(0,255,152,0.2)" : "rgba(253,10,83,0.2)")}; //fixme
	}

	.progress-bar {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		background: ${({ type }) => (type === "buy" ? "rgba(0,255,152,0.1)" : "rgba(253,10,83,0.1)")}; //fixme
		transition: all 0.3s;
		width: ${({ percent }) => (percent != null ? `${percent}%` : `0%`)};
	}

	color: ${({ type, theme }) => (type === "buy" ? theme.colors.green : theme.colors.red)};

	${TEXT_TYPES_MAP[TEXT_TYPES.NUMBER_SMALL]}
	& > :last-of-type {
		text-align: right;
	}

	& > * {
		flex: 1;
		text-align: left;
	}
`;
const Container = styled.div<{ fitContent?: boolean; reverse?: boolean }>`
	display: flex;
	flex-direction: column;
	justify-content: center;
	width: 100%;
	${({ fitContent }) => !fitContent && "height: 100%;"};
	${({ reverse }) => reverse && "flex-direction: column-reverse;"};
	height: 100%;
`;

const OrderBook: React.FC<IProps> = observer(({ mobileMode }) => {
	const vm = useTradeScreenVM();
	const [round] = useState("2");
	const { ordersStore } = useStores();
	const [orderFilter] = useState(0);
	const theme = useTheme();
	const [amountOfOrders, setAmountOfOrders] = useState(0);
	const oneSizeOrders = +new BN(amountOfOrders).div(2).toFixed(0) - 1;
	const calcSize = () => {
		const windowHeight = window.innerHeight - (mobileMode ? window.innerHeight / 2 + 96 : 212);
		const v = new BN(windowHeight).minus(48).div(19);
		const amountOfOrders = +v.toFixed(0);
		setAmountOfOrders(amountOfOrders);
	};

	useEffect(calcSize, [mobileMode]);
	const handleResize = useCallback(calcSize, [mobileMode]);

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

	if (ordersStore.orderbook.buy.length === 0 && ordersStore.orderbook.sell.length === 0)
		return (
			<Root
				style={{
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				No orders for this pair
			</Root>
		);
	else
		return (
			<Root>
				<Columns noHover>
					<Text type={TEXT_TYPES.BODY_SMALL} color={theme.colors.gray2} style={{ textAlign: "left" }}>
						Amount {vm.token0.symbol}
					</Text>
					<Text type={TEXT_TYPES.BODY_SMALL} color={theme.colors.gray2} style={{ textAlign: "center" }}>
						Total {vm.token1.symbol}
					</Text>
					<Text type={TEXT_TYPES.BODY_SMALL} color={theme.colors.gray2} style={{ textAlign: "right" }}>
						Price {vm.token1.symbol}
					</Text>
				</Columns>
				{/*<Divider />*/}
				<SizedBox height={8} />
				<Container fitContent={orderFilter === 1 || orderFilter === 2} reverse={orderFilter === 1}>
					{!ordersStore.initialized ? (
						<Skeleton height={20} style={{ marginBottom: 4 }} count={15} />
					) : (
						<>
							{orderFilter === 0 && (
								<Plug length={sellOrders.length < +oneSizeOrders ? +oneSizeOrders - 1 - sellOrders.length : 0} />
							)}
							{orderFilter !== 2 &&
								sellOrders.map((o, index) => (
									<OrderRow
										type="sell"
										percent={+new BN(o.fullFillPercent).toFormat(2)}
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
										<div color={theme.colors.white}>{o.amountLeft.toFormat(o.amountLeft.lt(0.01) ? 6 : 2)}</div>
										<div color={theme.colors.white}>{o.totalLeft.toFormat(o.totalLeft.lt(0.01) ? 6 : 2)}</div>
										<div>{new BN(o.price).toFormat(+round)}</div>
										<span className="progress-bar" />
									</OrderRow>
								))}
						</>
					)}
					{orderFilter === 0 && (
						<>
							<SizedBox height={8} />
							{/*<Divider />*/}
							<SizedBox height={8} />
						</>
					)}
					<Row>
						{!ordersStore.initialized ? (
							<>
								<Skeleton height={20} />
								<div />
								<Skeleton height={20} />
							</>
						) : (
							<Row style={{ paddingLeft: 14 }} alignItems="center">
								<Text type={TEXT_TYPES.NUMBER_MEDIUM} color={theme.colors.gray1}>
									SPREAD
								</Text>
								<SizedBox width={12} />
								<Text>{ordersStore.spreadPrice != null ? ordersStore.spreadPrice.toFixed(2) : ""}</Text>
								<SizedBox width={12} />
								<Text
									type={TEXT_TYPES.NUMBER_SMALL}
									color={
										ordersStore.spreadPercent && ordersStore.spreadPercent.toNumber() > 0 ? theme.colors.green : theme.colors.red
									}
								>
									{`(${ordersStore.spreadPercent && ordersStore.spreadPercent.toNumber() > 0 ? "+" : ""}${
										ordersStore.spreadPercent ? ordersStore.spreadPercent.toFixed(2) : "x"
									}%) `}
								</Text>
							</Row>
						)}
					</Row>
					{orderFilter === 0 && (
						<>
							<SizedBox height={8} />
							{/*<Divider />*/}
							<SizedBox height={8} />
						</>
					)}
					{!ordersStore.initialized ? (
						<Skeleton height={20} style={{ marginBottom: 4 }} count={15} />
					) : (
						<>
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
										percent={+new BN(o.fullFillPercent).toFormat(0)}
										type="buy"
										key={index + "positive"}
									>
										<div>{o.totalLeft.toFormat(o.totalLeft.lt(0.01) ? 6 : 2)}</div>
										<div>{o.amountLeft.toFormat(o.amountLeft.lt(0.01) ? 6 : 2)}</div>
										<div>{new BN(o.price).toFormat(+round)}</div>
										<span className="progress-bar" />
									</OrderRow>
								))}
							{orderFilter === 0 && (
								<Plug length={buyOrders.length < +oneSizeOrders ? +oneSizeOrders - 1 - buyOrders.length : 0} />
							)}
						</>
					)}
				</Container>
			</Root>
		);
});
export default OrderBook;

const PlugRow = styled(Row)`
	justify-content: space-between;
	margin-bottom: 1px;
	height: 18px;
	padding: 0 18px;
	box-sizing: border-box;

	& > * {
		color: ${({ theme }) => theme.colors.gray2};
	}
`;

const Plug: React.FC<{ length: number }> = ({ length }) => (
	<>
		{Array.from({ length }).map((_, index) => (
			<PlugRow key={index + "positive-plug"}>
				<Text type={TEXT_TYPES.NUMBER_SMALL}>-</Text>
				<Text type={TEXT_TYPES.NUMBER_SMALL}>-</Text>
				<Text type={TEXT_TYPES.NUMBER_SMALL}>-</Text>
			</PlugRow>
		))}
	</>
);
