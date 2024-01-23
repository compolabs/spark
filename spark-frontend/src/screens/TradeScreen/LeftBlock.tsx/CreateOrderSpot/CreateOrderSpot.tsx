import React, { ComponentProps, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Accordion } from "@szhsin/react-accordion";
import { observer } from "mobx-react";

import AccordionItem from "@components/AccordionItem";
import { Column, Row } from "@components/Flex";
import MaxButton from "@components/MaxButton";
import Select from "@components/Select";
import SizedBox from "@components/SizedBox";
import Slider from "@components/Slider";
import Text, { TEXT_TYPES } from "@components/Text";
import TokenInput from "@components/TokenInput";
import { useCreateOrderSpotVM } from "@screens/TradeScreen/LeftBlock.tsx/CreateOrderSpot/CreateOrderSpotVM";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import Button, { ButtonGroup } from "@src/components/Button";
import BN from "@src/utils/BN";
import { useStores } from "@stores";

interface IProps extends ComponentProps<any> {}

const Root = styled.div`
	padding: 12px;
`;

const StyledInfoIcon = styled(InfoIcon)`
	margin-right: 2px;

	path {
		fill: ${({ theme }) => theme.colors.textDisabled};
	}
`;

const orderTypes = [
	{ title: "Market", key: "market", disabled: true },
	{ title: "Limit", key: "limit" },
	{ title: "Stop Market", key: "stopmarket", disabled: true },
	{ title: "Stop Limit", key: "stoplimit", disabled: true },
	{ title: "Take Profit", key: "takeprofit", disabled: true },
	{ title: "Take Profit Limit", key: "takeprofitlimit", disabled: true },
];

const CreateOrderSpot: React.FC<IProps> = observer(({ ...rest }) => {
	const { accountStore, tradeStore } = useStores();
	const [percent, _setPercent] = useState(0);
	const vm = useCreateOrderSpotVM();
	const market = tradeStore.market;

	useEffect(() => {
		if (!market) return;

		const balance = accountStore.getBalance(vm.isSell ? market.baseToken.assetId : market.quoteToken.assetId);
		const value = vm.isSell ? vm.sellAmount : vm.buyTotal;

		if (!balance) return;

		balance.eq(0) ? _setPercent(0) : _setPercent(value.div(balance).times(100).toNumber());
	}, [accountStore.tokenBalances, vm.buyTotal, vm.isSell, vm.sellAmount]);

	if (!market) return null;
	const { baseToken, quoteToken } = market;

	const setPercent = (v: number) => {
		_setPercent(v);
		const balance = accountStore.getBalance(vm.isSell ? baseToken.assetId : quoteToken.assetId);

		if (!balance) return;

		const value = balance.times(v / 100).toNumber();
		vm.isSell ? vm.setSellAmount(new BN(value), true) : vm.setBuyTotal(new BN(value), true);
	};
	return (
		<Root {...rest}>
			<ButtonGroup>
				<Button active={!vm.isSell} onClick={() => vm.setIsSell(false)}>
					BUY
				</Button>
				<Button active={vm.isSell} onClick={() => vm.setIsSell(true)}>
					SELL
				</Button>
			</ButtonGroup>
			<SizedBox height={16} />
			<Row>
				<Column crossAxisSize="max">
					<Select label="Order type" options={orderTypes} selected={orderTypes[1].key} onSelect={() => null} />
					<SizedBox height={2} />
					<Row alignItems="center">
						<StyledInfoIcon />
						<Text type={TEXT_TYPES.SUPPORTING} disabled>
							About order type
						</Text>
					</Row>
				</Column>
				<SizedBox width={8} />
				<TokenInput
					amount={vm.isSell ? vm.sellPrice : vm.buyPrice}
					decimals={9}
					label="Market price"
					setAmount={(v) => (vm.isSell ? vm.setSellPrice(v, true) : vm.setBuyPrice(v, true))}
				/>
			</Row>
			<SizedBox height={2} />
			<Row alignItems="flex-end">
				<TokenInput
					amount={vm.isSell ? vm.sellAmount : vm.buyAmount}
					assetId={baseToken.assetId}
					decimals={baseToken.decimals}
					error={vm.isSell ? vm.sellAmountError : undefined}
					label="Order size"
					setAmount={(v) => (vm.isSell ? vm.setSellAmount(v, true) : vm.setBuyAmount(v, true))}
					// errorMessage="Insufficient amount"
				/>
				<SizedBox width={8} />
				<Column alignItems="flex-end" crossAxisSize="max">
					{/*todo починить функционал кнопки max*/}
					<MaxButton fitContent onClick={vm.onMaxClick}>
						MAX
					</MaxButton>
					<SizedBox height={4} />
					<TokenInput
						amount={vm.isSell ? vm.sellTotal : vm.buyTotal}
						assetId={quoteToken.assetId}
						decimals={quoteToken.decimals}
						error={vm.isSell ? undefined : vm.buyTotalError}
						setAmount={(v) => (vm.isSell ? vm.setSellTotal(v, true) : vm.setBuyTotal(v, true))}
						// errorMessage="Insufficient amount"
					/>
				</Column>
			</Row>
			<SizedBox height={4} />
			<Row alignItems="center" justifyContent="space-between">
				<Text type={TEXT_TYPES.SUPPORTING}>Available</Text>
				<Row alignItems="center" mainAxisSize="fit-content">
					<Text type={TEXT_TYPES.BODY} primary>
						{/*todo баланс сделать классом и добавить юнитсы*/}
						{BN.formatUnits(
							accountStore.getBalance(vm.isSell ? baseToken.assetId : quoteToken.assetId),
							vm.isSell ? baseToken.decimals : quoteToken.decimals,
						).toFormat(2) ?? "-"}
					</Text>
					<Text type={TEXT_TYPES.SUPPORTING}>&nbsp;{vm.isSell ? baseToken.symbol : quoteToken.symbol}</Text>
				</Row>
			</Row>
			{/*<Button onClick={vm.setupMarketMakingAlgorithm}>Setup market making algorithm</Button>*/}
			<SizedBox height={28} />
			<Slider max={100} min={0} percent={percent} step={1} value={percent} onChange={(v) => setPercent(v as number)} />
			<SizedBox height={28} />
			<Accordion transitionTimeout={400} transition>
				<AccordionItem
					header={
						<Row alignItems="center" justifyContent="space-between" mainAxisSize="stretch">
							<Text type={TEXT_TYPES.BUTTON_SECONDARY} nowrap primary>
								Order Details
							</Text>
							<Row alignItems="center" justifyContent="flex-end">
								<Text primary>{BN.formatUnits(vm.isSell ? vm.sellAmount : vm.buyAmount, baseToken.decimals).toFormat(2)}</Text>
								<Text>&nbsp;{baseToken.symbol}</Text>
							</Row>
						</Row>
					}
					defaultChecked
					initialEntered
				>
					<Row alignItems="center" justifyContent="space-between">
						<Text nowrap>Max buy</Text>
						<Row alignItems="center" justifyContent="flex-end">
							<Text primary>{BN.formatUnits(vm.isSell ? vm.sellTotal : vm.buyTotal, quoteToken.decimals).toFormat(2)}</Text>
							<Text>&nbsp;{quoteToken.symbol}</Text>
						</Row>
					</Row>
					<SizedBox height={8} />
					<Row alignItems="center" justifyContent="space-between">
						<Text nowrap>Matcher Fee</Text>
						<Row alignItems="center" justifyContent="flex-end">
							<Text primary>0.000001</Text>
							<Text>&nbsp;ETH</Text>
						</Row>
					</Row>
					<SizedBox height={8} />
					<Row alignItems="center" justifyContent="space-between">
						<Text nowrap>Total amount</Text>
						<Row alignItems="center" justifyContent="flex-end">
							<Text primary>{BN.formatUnits(vm.isSell ? vm.sellAmount : vm.buyAmount, baseToken.decimals).toFormat(2)}</Text>
							<Text>&nbsp;{baseToken.symbol}</Text>
						</Row>
					</Row>
				</AccordionItem>
			</Accordion>
			<SizedBox height={16} />
			<Button
				disabled={vm.loading ? true : vm.isSell ? !vm.canSell : !vm.canBuy}
				green={!vm.isSell}
				red={vm.isSell}
				onClick={vm.createOrder}
			>
				{vm.loading ? "Loading..." : vm.isSell ? `Sell ${baseToken.symbol}` : `Buy ${baseToken.symbol}`}
			</Button>
		</Root>
	);
});
export default CreateOrderSpot;
