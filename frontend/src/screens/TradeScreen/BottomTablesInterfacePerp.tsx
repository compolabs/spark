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
import tableSizeSelector from "@src/assets/icons/tablesSize.svg";
import tableSizeExtraSmall from "@src/assets/icons/tableSizeExtraSmall.svg";
import tableSmallSize from "@src/assets/icons/tableSmallSize.svg";
import tableMediumSize from "@src/assets/icons/tableMediumSize.svg";
import tableLargeSize from "@src/assets/icons/tableLargeSize.svg";
import Tooltip from "@components/Tooltip";
import { usePerpTradeVM } from "@screens/TradeScreen/PerpTradeVm";

interface IProps {}

const Root = styled.div<{ size: string }>`
	background: ${({ theme }) => theme.colors.bgSecondary};
	display: flex;
	width: 100%;
	flex-direction: column;
	box-sizing: border-box;
	border: 1px solid ${({ theme }) => theme.colors.bgSecondary};
	flex: 1;
	border-radius: 10px;

	max-width: 100%;
	overflow-x: scroll;

	& > * {
		min-width: 580px;
	}

	${({ size }) =>
		(() => {
			switch (size) {
				case "extraSmall":
					return `max-height: 120px;`;
				case "small":
					return `max-height: 197px;`;
				case "medium":
					return `max-height: 263px;`;
				case "large":
					return `max-height: 395px;`;
				default:
					return `max-height: 197px;`;
			}
		})()}
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
	position: relative;

	& > * {
		margin: 0 12px;
	}
`;
const TableSizeSelector = styled.div`
	position: absolute;
	right: 0;
	top: 4px;
`;
const TableSize = styled.div<{ active?: boolean }>`
	display: flex;
	align-items: center;
	padding: 4px 12px;
	box-sizing: border-box;
	width: 100%;
	cursor: pointer;

	${({ active, theme }) => active && `background: ${theme.colors.borderPrimary}`};

	:hover {
		background: ${({ theme }) => theme.colors.borderSecondary};
	}
`;
const CancelButton = styled(Chip)`
	cursor: pointer;
	border: 1px solid ${({ theme }) => theme.colors.borderPrimary} !important;
`;
const TokenIcon = styled.img`
	width: 12px;
	height: 12px;
	border-radius: 50%;
`;

const tabs = [
	{ title: "POSITIONS", disabled: false },
	{ title: "ORDERS", disabled: false },
	{ title: "UNSETTLED P&L", disabled: false },
	{ title: "TRADES", disabled: true },
	{ title: "BALANCES", disabled: true },
	{ title: "HISTORY", disabled: true },
];

const tableSizesConfig = [
	{ title: "Extra small", icon: tableSizeExtraSmall, size: "extraSmall" },
	{ title: "Small", icon: tableSmallSize, size: "small" },
	{ title: "Medium", icon: tableMediumSize, size: "medium" },
	{ title: "Large", icon: tableLargeSize, size: "large" },
];
const BottomTablesInterfacePerp: React.FC<IProps> = observer(() => {
	//todo add history
	//todo add UNSETTLED P&L
	const positionColumns = React.useMemo(
		() => [
			{ Header: "Trading Pair", accessor: "pair" },
			{ Header: "Size", accessor: "size" },
			{ Header: "Avg.Ent Price", accessor: "entPrice" },
			{ Header: "Mark price", accessor: "markPrice" },
			{
				Header: "Main. margin",
				accessor: "maintenanceMargin",
				info: "Minimum collateral to prevent liquidation.",
			}, //todo implement math
			{
				Header: "Initial margin",
				accessor: "positionMargin",
				info: "Required upfront collateral for opening a position.",
			},
			{ Header: "Unrealized PNL", accessor: "pnl" },
			{ Header: "", accessor: "action" },
		],
		[],
	);
	//todo add data
	const orderColumns = React.useMemo(
		() => [
			{ Header: "Market", accessor: "market" },
			{ Header: "Type", accessor: "type" },
			{ Header: "Size", accessor: "size" },
			{ Header: "Action", accessor: "action" },
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
	const { tradeStore, settingsStore } = useStores();
	const vm = usePerpTradeVM();
	const columns = [positionColumns, orderColumns, unsettledPnLColumns];
	const [tableSize, setTableSize] = useState(settingsStore.tradeTableSize ?? "small");
	const [tabIndex, setTabIndex] = useState(0);
	const [data, setData] = useState<any>([]);
	const theme = useTheme();
	useMemo(() => {
		switch (tabIndex) {
			case 0:
				setData(
					tradeStore.positions.map((position) => {
						const market = tradeStore.perpMarkets.find((m) => m.symbol === position.symbol);
						// const mmRatio = BN.formatUnits(market?.mmRatio ?? 0, 4);
						const markPrice =
							tradeStore.perpPrices == null ? BN.ZERO : tradeStore.perpPrices[position.token.assetId]?.markPrice;
						//todo fix this
						//markPrice.mul(positionSize).mul(mmRatio)
						//  6 				6				6			 6
						// markPrice.mul(positionSize).mul(mmRatio).mul(marketPrice)

						//maintance margin - для поддерживания позиций
						//initial margin -  маржин отображающий сколько денег осталось для открытия бущудший позиций

						// const val = markPrice.times(position.takerPositionSize).times(mmRatio).times(markPrice);
						const margin = markPrice?.times(position.takerPositionSize).times(market?.mmRatio ?? 0);
						// const margin = BN.ZERO;

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
							action: <CancelButton onClick={() => null}>{vm.loading ? "..." : "Cancel"}</CancelButton>,
						};
					}),
				);
				break;
			case 1:
				setData(
					tradeStore.perpUserOrders.map((order) => {
						return {
							market: (
								<Row alignItems="center">
									<TokenIcon src={order.token.logo} alt="market-icon" />
									<SizedBox width={4} />
									<Text>{order.marketSymbol}</Text>
								</Row>
							),
							type: "Limit",
							size: order.formattedSize,
							action: (
								<CancelButton onClick={() => vm.cancelPerpOrders(order.orderId)}>{vm.loading ? "..." : "Cancel"}</CancelButton>
							),
						};
					}),
				);
				break;
			case 2:
				break;
		}
	}, [
		tabIndex,
		tradeStore.positions,
		tradeStore.perpPrices,
		theme.colors.greenLight,
		theme.colors.redLight,
		tradeStore.perpMarkets,
		tradeStore.perpOrders,
	]);

	return (
		<Root size={tableSize}>
			<TabContainer>
				{tabs.map(({ title, disabled }, index) => (
					<Tab
						disabled={disabled}
						key={title + index}
						active={tabIndex === index}
						onClick={() => !disabled && setTabIndex(index)}
					>
						{title}
					</Tab>
				))}
				<TableSizeSelector>
					<Tooltip
						config={{ placement: "bottom-start", trigger: "click" }}
						content={
							<Column crossAxisSize="max" style={{ zIndex: 500 }}>
								{tableSizesConfig.map(({ size, icon, title }) => (
									<TableSize active={size === tableSize} onClick={() => setTableSize(size)} key={title}>
										<img src={icon} alt={title} />
										<SizedBox width={4} />
										<Text nowrap type={TEXT_TYPES.BUTTON}>
											{title.toUpperCase()}
										</Text>
									</TableSize>
								))}
							</Column>
						}
					>
						<img src={tableSizeSelector} alt="tableSizeSelector" style={{ cursor: "pointer" }} />
					</Tooltip>
				</TableSizeSelector>
			</TabContainer>
			<Column style={{ overflowY: "scroll" }} crossAxisSize="max">
				<Table
					columns={columns[tabIndex]}
					data={data}
					style={{
						whiteSpace: "nowrap",
						width: "fitContent",
						minWidth: "fit-content",
					}}
				/>
			</Column>
		</Root>
	);
});
export default BottomTablesInterfacePerp;
