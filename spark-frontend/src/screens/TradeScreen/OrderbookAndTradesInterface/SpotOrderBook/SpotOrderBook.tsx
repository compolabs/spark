import React, { HTMLAttributes, useCallback, useEffect } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";

import Select from "@components/Select";
import SizedBox from "@components/SizedBox";
import Text, { TEXT_TYPES } from "@components/Text";
import sellAndBuy from "@src/assets/icons/buyAndSellOrderBookIcon.svg";
import buy from "@src/assets/icons/buyOrderBookIcon.svg";
import sell from "@src/assets/icons/sellOrderBookIcon.svg";
import { Column, Row } from "@src/components/Flex";
import BN from "@src/utils/BN";
import hexToRgba from "@src/utils/hexToRgb";
import useEventListener from "@src/utils/useEventListener";

import { SpotOrderbookVMProvider, useSpotOrderbookVM } from "./SpotOrderbookVM";

//todo отрефакторить и возможно перенесть часть логики в вью модель
//todo добавить лоадер
interface IProps extends HTMLAttributes<HTMLDivElement> {
	mobileMode?: boolean;
}

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

const OrderBookHeader = styled.div`
	width: 100%;
	box-sizing: border-box;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	padding: 0 12px;
	text-align: center;

	& > * {
		text-align: start;
	}

	& > :last-of-type {
		text-align: end;
	}
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
		width: ${({ fulfillPercent }) => (fulfillPercent ? `${fulfillPercent}%` : `0%`)};
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
		width: ${({ volumePercent }) => (volumePercent ? `${volumePercent}%` : `0%`)};
	}

	& > div:last-of-type {
		text-align: right;
	}

	& > div {
		flex: 1;
		text-align: left;
		z-index: 1;
	}
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

const SpotOrderBookImpl: React.FC<IProps> = observer(({ mobileMode }) => {
	const vm = useSpotOrderbookVM();
	const theme = useTheme();
	// 48 + 50 + 4 + 26 + (12 + 32 + 8 + 16 + 24); //220
	// 48 + 50 + 4 + 26 + (12 + 32 + 8 + 32 + 8 + 16 + 24); //260

	useEffect(() => {
		vm.calcSize();
	}, [mobileMode]);
	const handleResize = useCallback(() => {
		vm.calcSize();
	}, []);

	useEventListener("resize", handleResize);

	if (vm.orderbook.buy.length === 0 && vm.orderbook.sell.length === 0)
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
					selected={vm.decimalKey}
					onSelect={({ key }) => vm.setDecimalKey(key)}
				/>
				{[sellAndBuy, sell, buy].map((image, index) => (
					<SettingIcon
						key={index}
						alt="filter"
						selected={vm.orderFilter === index}
						src={image}
						onClick={() => vm.setOrderFilter(index)}
					/>
				))}
			</SettingsContainder>
			<SizedBox height={8} />
			<OrderBookHeader>
				{/*todo добавить описание  в каком токене столбец (например Amount BTC | Total USDC | Price USDC)*/}
				<Text type={TEXT_TYPES.SUPPORTING}>Amount </Text>
				<Text type={TEXT_TYPES.SUPPORTING}>Total </Text>
				<Text type={TEXT_TYPES.SUPPORTING}>Price </Text>
			</OrderBookHeader>
			<SizedBox height={8} />
			<Container fitContent={vm.orderFilter === 1 || vm.orderFilter === 2} reverse={vm.orderFilter === 1}>
				{vm.orderFilter === 0 && (
					<Plug length={vm.sellOrders.length < +vm.oneSizeOrders ? +vm.oneSizeOrders - 1 - vm.sellOrders.length : 0} />
				)}
				{vm.orderFilter === 1 && (
					<Plug length={vm.sellOrders.length < +vm.amountOfOrders ? +vm.amountOfOrders - 1 - vm.sellOrders.length : 0} />
				)}

				{vm.orderFilter !== 2 &&
					vm.sellOrders.map((o, index) => (
						<OrderRow
							key={index + "negative"}
							type="sell"
							volumePercent={o.baseSize.div(vm.totalSell).times(100).toNumber()}
							onClick={() => {
								// todo при нажатии на строку устанавливать цену и количество в интерфейс создания заказа
								// const price = BN.parseUnits(o.price, vm.token1.decimals);
								// vm.setIsSell(false);
								// vm.setBuyPrice(price, true);
								// // vm.setSellAmpount(new BN(o.amount), true);
								// vm.setSellPrice(BN.ZERO, true);
								// vm.setSellAmount(BN.ZERO, true);
								// vm.setSellTotal(BN.ZERO, true);
							}}
						>
							<span className="progress-bar" />
							<span className="volume-bar" />
							<Text primary>{o.baseSizeUnits.toFormat(DECIMAL_OPTIONS[+vm.decimalKey])}</Text>
							<Text primary>{o.quoteSizeUnits.toFormat(DECIMAL_OPTIONS[+vm.decimalKey])}</Text>
							{/*todo сделать order классом, добавть priceUnits и использоваь тут priceUnits*/}
							{/*todo еще мне не нравится как выглядит .toFormat(DECIMAL_OPTIONS[+vm.decimalKey])*/}
							<Text color={theme.colors.redLight}>{BN.formatUnits(o.price, 9).toFormat(DECIMAL_OPTIONS[+vm.decimalKey])}</Text>
						</OrderRow>
					))}

				{vm.orderFilter === 0 && (
					<SpreadRow>
						<Text type={TEXT_TYPES.SUPPORTING}>SPREAD</Text>
						<SizedBox width={12} />
						<Text primary>{vm.orderbook.spreadPrice}</Text>
						<SizedBox width={12} />
						<Text color={+vm.orderbook.spreadPercent > 0 ? theme.colors.greenLight : theme.colors.redLight}>
							{`(${+vm.orderbook.spreadPercent > 0 ? "+" : ""}${vm.orderbook.spreadPercent}%) `}
						</Text>
					</SpreadRow>
				)}

				{vm.orderFilter !== 1 &&
					vm.buyOrders.map((o, index) => (
						<OrderRow
							key={index + "positive"}
							type="buy"
							volumePercent={o.quoteSize.div(vm.totalBuy).times(100).toNumber()}
							onClick={() => {
								// todo при нажатии на строку устанавливать цену и количество в интерфейс создания заказа
								// const price = BN.parseUnits(o.price, vm.token1.decimals);
								// vm.setIsSell(true);
								// vm.setSellPrice(price, true);
								// vm.setBuyPrice(BN.ZERO, true);
								// vm.setBuyAmount(BN.ZERO, true);
								// vm.setBuyTotal(BN.ZERO, true);
							}}
						>
							<span className="progress-bar" />
							<span className="volume-bar" />
							<Text primary>{o.baseSizeUnits.toFormat(DECIMAL_OPTIONS[+vm.decimalKey])}</Text>
							<Text primary>{o.quoteSizeUnits.toFormat(DECIMAL_OPTIONS[+vm.decimalKey])}</Text>
							<Text color={theme.colors.greenLight}>
								{BN.formatUnits(o.price, 9).toFormat(DECIMAL_OPTIONS[+vm.decimalKey])}
							</Text>
						</OrderRow>
					))}

				{vm.orderFilter === 2 && (
					<Plug length={vm.buyOrders.length < +vm.amountOfOrders ? +vm.amountOfOrders - 1 - vm.buyOrders.length : 0} />
				)}
				{vm.orderFilter === 0 && (
					<Plug length={vm.buyOrders.length < +vm.oneSizeOrders ? +vm.oneSizeOrders - 1 - vm.buyOrders.length : 0} />
				)}
			</Container>
		</Root>
	);
});

const SpotOrderBook = () => (
	<SpotOrderbookVMProvider>
		<SpotOrderBookImpl />
	</SpotOrderbookVMProvider>
);
export default SpotOrderBook;

const PlugRow = styled(Row)`
	justify-content: space-between;
	margin-bottom: 1px;
	height: 16px;
	padding: 0 12px;
	box-sizing: border-box;
`;

const Plug: React.FC<{
	length: number;
}> = ({ length }) => (
	<>
		{Array.from({ length }).map((_, index) => (
			<PlugRow key={index + "positive-plug"}>
				<Text>-</Text>
				<Text>-</Text>
				<Text>-</Text>
			</PlugRow>
		))}
	</>
);
