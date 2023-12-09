import styled from "@emotion/styled";
import { Column, Row } from "@src/components/Flex";
import React, { useMemo, useState } from "react";
import { observer } from "mobx-react";
import { useStores } from "@stores";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import Chip from "@src/components/Chip";
import Tab from "@components/Tab";
import Table from "@src/components/Table";
import SizedBox from "@components/SizedBox";
import { useTheme } from "@emotion/react";
import BN from "@src/utils/BN";

interface IProps {}

const Root = styled.div`
	background: ${({ theme }) => theme.colors.bgSecondary};
	display: flex;
	width: 100%;
	flex-direction: column;
	box-sizing: border-box;
	border: 1px solid ${({ theme }) => theme.colors.bgSecondary};
	flex: 1;
	max-height: 190px;
	overflow: hidden;
	border-radius: 10px;

	max-width: 100%;
	overflow-x: scroll;

	& > * {
		min-width: 580px;
	}
`;

export const TableTitle = styled(Text)`
	flex: 1;
	white-space: nowrap;
	${TEXT_TYPES_MAP[TEXT_TYPES.SUPPORTING]}
`;

export const TableText = styled(Text)`
	flex: 1;
	display: flex;
	align-items: center;
`;

export const TableRow = styled(Row)`
	margin-bottom: 1px;
	height: 32px;
	flex-shrink: 0;
	background: ${({ theme }) => theme.colors.bgPrimary};
	align-items: center;
	padding: 0 12px;
	box-sizing: border-box;

	:last-of-type {
		margin-bottom: 0;
	}
`;

export const TableBody = styled(Column)`
	overflow: scroll;
	width: 100%;
	box-sizing: border-box;
`;

const TabContainer = styled(Row)`
	align-items: center;
	box-sizing: border-box;
	padding: 0 12px;
	height: 32px;

	& > * {
		margin: 0 12px;
	}
`;

const CancelButton = styled(Chip)`
	cursor: pointer;
	border: 1px solid ${({ theme }) => theme.colors.borderPrimary} !important;
`;

const tabs = [
	{ title: "POSITIONS", disabled: false },
	{ title: "ORDERS", disabled: false },
	{ title: "UNSETTLED P&L", disabled: false },
	{ title: "TRADES", disabled: true },
	{ title: "BALANCES", disabled: true },
	{ title: "HISTORY", disabled: true },
];

const BottomTablesInterface: React.FC<IProps> = observer(() => {
	//todo add history
	//todo add UNSETTLED P&L
	const positionColumns = React.useMemo(
		() => [
			{ Header: "Trading Pair", accessor: "pair" },
			{ Header: "Size", accessor: "size" },
			{ Header: "Avg.Ent Price", accessor: "entPrice" },
			{ Header: "Mark price", accessor: "markPrice" },
			{ Header: "Marg. Ratio", accessor: "mmRation" },
			{ Header: "Margin", accessor: "margin" },
			{ Header: "Unrealized PNL", accessor: "pnl" },
			{ Header: "", accessor: "action" },
		],
		[],
	);
	const orderColumns = React.useMemo(
		() => [
			{ Header: "Date", accessor: "date" },
			{ Header: "Pair", accessor: "pair" },
			{ Header: "Status", accessor: "status" },
			{ Header: "Type", accessor: "type" },
			{ Header: "Amount", accessor: "amount" },
			{ Header: "Filled", accessor: "filled" },
			{ Header: "Price", accessor: "price" },
			{ Header: "", accessor: "action" },
		],
		[],
	);
	const unsettledPnLColumns = React.useMemo(
		() => [
			{ Header: "Market", accessor: "market" },
			{ Header: "Cost basis", accessor: "costBasis" },
			{ Header: "Settled P&L", accessor: "pnl" },
			{ Header: "Unsettled funding", accessor: "funding" },
			{ Header: "Claimable/Unsettled PnL", accessor: "amount" },
			{ Header: "", accessor: "action" },
		],
		[],
	);
	const columns = [positionColumns, orderColumns, unsettledPnLColumns];
	const { ordersStore, tradeStore, accountStore } = useStores();
	const [tabIndex, setTabIndex] = useState(0);
	const [data, setData] = useState<any>([]);
	const theme = useTheme();
	useMemo(() => {
		switch (tabIndex) {
			case 0:
				setData(
					tradeStore.positions.map((position) => {
						const market = tradeStore.perpMarkets.find((m) => m.symbol === position.symbol);
						const mmRatio = BN.formatUnits(market?.mmRatio ?? 0, 4);
						const markPrice =
							tradeStore.perpPrices == null ? BN.ZERO : tradeStore.perpPrices[position.token.assetId]?.markPrice;
						//todo fix this
						//markPrice.mul(positionSize).mul(mmRatio)
						// const val = BN.formatUnits(markPrice, 6)
						// 	.times(BN.formatUnits(position.takerPositionSize, 6))
						// 	.times(mmRatio)
						// 	.toFormat(2);
						// const margin = markPrice?.times(position.takerPositionSize).times(market?.mmRatio ?? 0);
						const margin = BN.ZERO;

						//todo fix this
						//positionSize.mul(markPrice) + positionNotional
						// console.log("takerOpenNotional", position.takerOpenNotional.div(1e8).toString());
						// const unrealizedPnL = BN.formatUnits(position.takerPositionSize.times(markPrice), 6).plus(
						// 	position.takerOpenNotional,
						// );
						const unrealizedPnL = BN.ZERO;

						return {
							pair: (
								<Column justifyContent="center">
									{position.symbol}
									<SizedBox height={2} />
									<Text color={position.takerPositionSize.lt(0) ? theme.colors.redLight : theme.colors.greenLight}>
										{position.takerPositionSize.lt(0) ? "Short" : "Long"}
									</Text>
								</Column>
							),
							size: (
								<Row alignItems="center" justifyContent="center">
									{position.formattedAbsSize}
									<SizedBox width={4} />
									<Chip>{position.token.symbol}</Chip>
								</Row>
							),
							entPrice: `$ ${position.entPrice}`,
							markPrice: BN.formatUnits(markPrice, 6).toFormat(2),
							mmRation: `${mmRatio.toString()} %`,
							margin: (
								<Row alignItems="center" justifyContent="center">
									{margin.toFormat()}
									<SizedBox width={4} />
									<Chip>USDC</Chip>
								</Row>
							),
							pnl: (
								<Row alignItems="center" justifyContent="center">
									{unrealizedPnL.toFormat()}
									<SizedBox width={4} />
									<Chip>USDC</Chip>
								</Row>
							),
							action: <CancelButton>Cancel</CancelButton>,
						};
					}),
				);
				break;
			case 1:
				setData(
					ordersStore.myOrders.map(() => ({
						date: "date",
						pair: "pair",
						status: "status",
						type: "type",
						amount: "amount",
						filled: "filled",
						price: "price",
						action: "",
					})),
				);
				break;
			case 2:
				setData(
					ordersStore.myOrders.map(() => ({
						market: "market",
						costBasis: "costBasis",
						pnl: "pnl",
						funding: "funding",
						amount: "amount",
						action: "",
					})),
				);
				break;
		}
	}, [accountStore.address, accountStore.isLoggedIn, tabIndex, tradeStore.positions, tradeStore.perpPrices]);
	return (
		<Root>
			<TabContainer>
				{tabs.map(({ title, disabled }, index) => (
					<Tab disabled={disabled} key={title} active={tabIndex === index} onClick={() => !disabled && setTabIndex(index)}>
						{title}
					</Tab>
				))}
			</TabContainer>
			<Table
				columns={columns[tabIndex]}
				data={data}
				style={{
					whiteSpace: "nowrap",
					width: "fitContent",
					minWidth: "fit-content",
				}}
			/>
		</Root>
	);
});
export default BottomTablesInterface;
