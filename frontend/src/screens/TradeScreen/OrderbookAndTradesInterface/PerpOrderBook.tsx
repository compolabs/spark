import styled from "@emotion/styled";
import React, { HTMLAttributes, useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import SizedBox from "@components/SizedBox";
import BN from "@src/utils/BN";
import { useStores } from "@stores";
import { Column, Row } from "@src/components/Flex";
import Text, { TEXT_TYPES } from "@components/Text";
import { useTheme } from "@emotion/react";
import useEventListener from "@src/utils/useEventListener";
import hexToRgba from "@src/utils/hexToRgb";
import Select from "@components/Select";
import shortIcon from "@src/assets/icons/sellOrderBookIcon.svg";
import longIcon from "@src/assets/icons/buyAndSellOrderBookIcon.svg";
import shortAndBuyIcon from "@src/assets/icons/buyAndSellOrderBookIcon.svg";
import { usePerpTradeVM } from "@screens/TradeScreen/PerpTradeVm";

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

const OrderBookHeader = styled.div<{}>`
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
	type: "long" | "short";
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
			type === "long" ? hexToRgba(theme.colors.greenLight, 0.1) : hexToRgba(theme.colors.redLight, 0.1)};
	}

	.progress-bar {
		z-index: 0;
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		background: ${({ type, theme }) =>
			type === "long" ? hexToRgba(theme.colors.greenLight, 0.1) : hexToRgba(theme.colors.redLight, 0.1)};
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
			type === "long" ? hexToRgba(theme.colors.greenLight, 0.3) : hexToRgba(theme.colors.redLight, 0.3)};
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

const PerpOrderBook: React.FC<IProps> = observer(({ mobileMode }) => {
	const vm = usePerpTradeVM();
	const { tradeStore } = useStores();
	const theme = useTheme();
	const [decimalKey, setDecimalKey] = useState("0");
	const [orderFilter, setOrderFilter] = useState(0);
	const [amountOfOrders, setAmountOfOrders] = useState(0);
	const oneSizeOrders = +new BN(amountOfOrders).div(2).toFixed(0) - 1;

	const calcSize = () => setAmountOfOrders(+new BN(window.innerHeight - 260).div(17).toFixed(0));

	useEffect(calcSize, [mobileMode]);
	const handleResize = useCallback(calcSize, []);

	useEventListener("resize", handleResize);

	const longOrders = tradeStore.perpOrders
		.filter((o) => o.baseSize.gt(0))
		.sort((a, b) => {
			if (a.orderPrice == null && b.orderPrice == null) return 0;
			if (a.orderPrice == null && b.orderPrice != null) return 1;
			if (a.orderPrice == null && b.orderPrice == null) return -1;
			return a.orderPrice.lt(b.orderPrice) ? 1 : -1;
		})
		.slice(orderFilter === 0 ? -oneSizeOrders : -amountOfOrders);
	const shortOrders = tradeStore.perpOrders
		.filter((o) => o.baseSize.lt(0))
		.sort((a, b) => {
			if (a.orderPrice == null && b.orderPrice == null) return 0;
			if (a.orderPrice == null && b.orderPrice != null) return 1;
			if (a.orderPrice == null && b.orderPrice == null) return -1;
			return a.orderPrice.lt(b.orderPrice) ? 1 : -1;
		})
		.slice(orderFilter === 0 ? -oneSizeOrders : -amountOfOrders);

	const firstLongPrice = longOrders[longOrders.length - 1]?.orderPrice ?? BN.ZERO;
	const firstShortPrice = shortOrders[0]?.orderPrice ?? BN.ZERO;
	const spread = firstShortPrice.minus(firstLongPrice).abs();
	if (tradeStore.perpOrders.length === 0)
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
				{[shortAndBuyIcon, shortIcon, longIcon].map((image, index) => (
					<SettingIcon
						key={index}
						src={image}
						alt="filter"
						selected={orderFilter === index}
						onClick={() => setOrderFilter(index)}
					/>
				))}
			</SettingsContainder>
			<SizedBox height={8} />
			<OrderBookHeader>
				<Text type={TEXT_TYPES.SUPPORTING}>Amount {vm.token0.symbol}</Text>
				<Text type={TEXT_TYPES.SUPPORTING}>Total {vm.token1.symbol}</Text>
				<Text type={TEXT_TYPES.SUPPORTING}>Price {vm.token1.symbol}</Text>
			</OrderBookHeader>
			<SizedBox height={8} />
			<Container fitContent={orderFilter === 1 || orderFilter === 2} reverse={orderFilter === 1}>
				{orderFilter === 0 && (
					<Plug length={shortOrders.length < +oneSizeOrders ? +oneSizeOrders - 1 - shortOrders.length : 0} />
				)}
				{orderFilter === 1 && (
					<Plug length={shortOrders.length < +amountOfOrders ? +amountOfOrders - 1 - shortOrders.length : 0} />
				)}

				{orderFilter !== 2 &&
					shortOrders.map((o, index) => (
						<OrderRow type="short" key={index + "negative"} onClick={() => {}}>
							<span className="progress-bar" />
							<span className="volume-bar" />
							<Text primary>{o.formattedSize.abs().toFormat(DECIMAL_OPTIONS[+decimalKey])}</Text>
							<Text primary>{o.formattedTotal.abs().toFormat(DECIMAL_OPTIONS[+decimalKey])}</Text>
							<Text color={theme.colors.redLight}>{o.formattedPrice.toFormat(DECIMAL_OPTIONS[+decimalKey])}</Text>
						</OrderRow>
					))}

				{orderFilter === 0 && (
					<SpreadRow>
						<Text type={TEXT_TYPES.SUPPORTING}>SPREAD</Text>
						<SizedBox width={12} />
						<Text primary>{BN.formatUnits(spread, 6).toFormat(2)}</Text>
						<SizedBox width={12} />
					</SpreadRow>
				)}

				{orderFilter !== 1 &&
					longOrders.map((o, index) => (
						<OrderRow type="long" key={index + "positive"}>
							<span className="progress-bar" />
							<span className="volume-bar" />
							<Text primary>{o.formattedSize.toFormat(DECIMAL_OPTIONS[+decimalKey])}</Text>
							<Text primary>{o.formattedTotal.toFormat(DECIMAL_OPTIONS[+decimalKey])}</Text>
							<Text color={theme.colors.greenLight}>{o.formattedPrice.toFormat(DECIMAL_OPTIONS[+decimalKey])}</Text>
						</OrderRow>
					))}

				{orderFilter === 2 && (
					<Plug length={longOrders.length < +amountOfOrders ? +amountOfOrders - 1 - longOrders.length : 0} />
				)}
				{orderFilter === 0 && (
					<Plug length={longOrders.length < +oneSizeOrders ? +oneSizeOrders - 1 - longOrders.length : 0} />
				)}
			</Container>
		</Root>
	);
});
export default PerpOrderBook;

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
