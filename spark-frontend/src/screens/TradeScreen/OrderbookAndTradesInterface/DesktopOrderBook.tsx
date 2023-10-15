import styled from "@emotion/styled";
import React, { HTMLAttributes, useState } from "react";
import { observer } from "mobx-react-lite";
// import sell from "@src/assets/icons/sellOrderBookIcon.svg";
// import buy from "@src/assets/icons/buyOrderBookIcon.svg";
// import sellAndBuy from "@src/assets/icons/buyAndSellOrderBookIcon.svg";
// import Divider from "@src/components/Divider";
import SizedBox from "@components/SizedBox";
// import Text from "@components/Text";
import { useTradeScreenVM } from "@screens/TradeScreen/TradeScreenVm";
import BN from "@src/utils/BN";
import { useStores } from "@stores";
import Skeleton from "react-loading-skeleton";
import { Row } from "@src/components/Flex";
// import Select from "@src/components/Select";
// import NoData from "@components/NoData";
// import { TRADE_TYPE } from "@src/services/TradesService";

interface IProps extends HTMLAttributes<HTMLDivElement> {}

const Root = styled.div`
	display: flex;
	flex-direction: column;
	grid-area: orderbook;
`;

// const Settings = styled.div`
//   display: flex;
//   flex-direction: row;
//   align-items: center;
//   width: 100%;
// `;
// const Icon = styled.img<{ selected?: boolean }>`
//   cursor: pointer;
//   margin-right: 8px;
//   ${({ selected }) => selected && "background: #3A4050; border-radius: 4px;"};
// `;
const Columns = styled.div<{ noHover?: boolean; percent?: number }>`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	${({ noHover }) => !noHover && "cursor: pointer;"};

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
	margin: 4px 0;
	width: 100%;
	justify-content: space-between;

	&:hover {
		background: #2d2d2d;
	}

	.progress-bar {
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		background: ${({ type }) => (type === "buy" ? "rgba(37, 176, 91, 0.1)" : "rgba(229, 73, 77, 0.1)")};
		transition: all 0.3s;
		width: ${({ percent }) => (percent != null ? `${percent}%` : `0%`)};
	}

	color: ${({ type }) => (type === "buy" ? "green" : "red")};
	font-size: 12px;
`;
const Container = styled.div<{ fitContent?: boolean; reverse?: boolean }>`
	display: flex;
	flex-direction: column;
	justify-content: center;
	width: 100%;
	${({ fitContent }) => !fitContent && "height: 100%;"};
	${({ reverse }) => reverse && "flex-direction: column-reverse;"};
`;
// const roundOptions = [2, 4, 5, 6].map((v) => ({
//   title: `${v} decimals`,
//   key: v.toString()
// }));
// const filters = [sellAndBuy, sell, buy];

const DesktopOrderBook: React.FC<IProps> = () => {
	const vm = useTradeScreenVM();
	const [round, setRound] = useState("2");
	const { ordersStore } = useStores();
	const [orderFilter, setOrderFilter] = useState(0);

	const buyOrders = ordersStore.orderbook.buy
		.slice()
		.sort((a, b) => {
			if (a.price == null && b.price == null) return 0;
			if (a.price == null && b.price != null) return 1;
			if (a.price == null && b.price == null) return -1;
			return a.price < b.price ? 1 : -1;
		})
		.reverse()
		.slice(orderFilter === 0 ? -12 : -35)
		.reverse();
	const sellOrders = ordersStore.orderbook.sell
		.slice()
		.sort((a, b) => {
			if (a.price == null && b.price == null) return 0;
			if (a.price == null && b.price != null) return 1;
			if (a.price == null && b.price == null) return -1;
			return a.price < b.price ? 1 : -1;
		})
		.slice(orderFilter === 0 ? -12 : -35);
	const columns = [`Price ${vm.token1.symbol}`, `Amount ${vm.token0.symbol}`, `Total ${vm.token1.symbol}`];

	if (ordersStore.orderbook.buy.length === 0 && ordersStore.orderbook.sell.length === 0)
		return (
			<Root
				style={{
					alignItems: "center",
					justifyContent: "center"
				}}
			>
				No orders for this pair
			</Root>
		);
	else
		return (
			<Root>
				<Columns noHover>
					<div style={{ fontSize: 14, textAlign: "left" }}>
						<b> {columns[0]}</b>
					</div>
					<div style={{ fontSize: 14, textAlign: "center" }}>
						<b> {columns[1]}</b>
					</div>
					<div style={{ fontSize: 14, textAlign: "right" }}>
						<b> {columns[2]}</b>
					</div>
				</Columns>
				<SizedBox height={8} />
				<Container fitContent={orderFilter === 1 || orderFilter === 2} reverse={orderFilter === 1}>
					{!ordersStore.initialized ? (
						<Skeleton height={20} style={{ marginBottom: 4 }} count={13} />
					) : (
						<>
							{orderFilter === 0 && <Plug length={sellOrders.length < 12 ? 11 - sellOrders.length : 0} />}
							{orderFilter !== 2 &&
								sellOrders.map((o, index) => (
									//Todo add hover
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
										<div>{new BN(o.price).toFormat(+round)}</div>
										<div style={{ textAlign: "center" }}>
											{/*Todo добавить плоосу закрытия*/}
											{o.amountLeft}
										</div>
										<div style={{ textAlign: "right" }}>{o.totalLeft}</div>
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
							<Row>
								<div>{vm.latestTrade?.priceFormatter}</div>
								{/*todo add spread calc*/}
								{/*<Text*/}
								{/*  textAlign="right"*/}
								{/*  type="secondary"*/}
								{/*  size="small"*/}
								{/*>{`SPREAD ${spread} %`}</Text>*/}
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
						<Skeleton height={20} style={{ marginBottom: 4 }} count={13} />
					) : (
						<>
							{orderFilter !== 1 &&
								buyOrders.map((o, index) => (
									//Todo add hover
									<OrderRow percent={+new BN(o.fullFillPercent).toFormat(0)} type="buy" key={index + "positive"}>
										<div
											onClick={() => {
												const price = BN.parseUnits(o.price, vm.token1.decimals);
												vm.setIsSell(true);
												vm.setSellPrice(price, true);
												// vm.setBuyAmount(new BN(o.amount), true);
												vm.setBuyPrice(BN.ZERO, true);
												vm.setBuyAmount(BN.ZERO, true);
												vm.setBuyTotal(BN.ZERO, true);
											}}
										>
											{new BN(o.price).toFormat(+round)}
										</div>
										<div>
											{/*Todo добавить полосу закрытия*/}
											{o.totalLeft}
										</div>
										<div>{o.amountLeft}</div>
										<span className="progress-bar" />
									</OrderRow>
								))}
							{orderFilter === 0 && <Plug length={buyOrders.length < 12 ? 11 - buyOrders.length : 0} />}
						</>
					)}
				</Container>
			</Root>
		);
};
export default observer(DesktopOrderBook);

const Plug: React.FC<{ length: number }> = ({ length }) => (
	<>
		{Array.from({ length }).map((_, index) => (
			<Row style={{ margin: "4px 0" }} key={index + "positive-plug"}>
				<div style={{ fontSize: 12 }}>---</div>
				{/*{Array.from({ length: 3 }).map((_, i) => (*/}
				{/*  <div key={} style={{fontSize: 12}}>*/}
				{/*    -*/}
				{/*  </div>*/}
				{/*))}*/}
			</Row>
		))}
	</>
);
