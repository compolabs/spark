import styled from "@emotion/styled";
import { Column, Row } from "@components/Flex";
import React, { ComponentProps, useEffect, useState } from "react";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react";
import { useTradeScreenVM } from "@screens/TradeScreen/TradeScreenVm";
import TokenInput from "@components/TokenInput";
import Button, { ButtonGroup } from "@components/Button";
import Select from "@components/Select";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import { useStores } from "@stores";
import AccordionItem from "@components/AccordionItem";
import BN from "@src/utils/BN";
import Slider from "@components/Slider";
import { Accordion } from "@szhsin/react-accordion";

interface IProps extends ComponentProps<any> {}

const Root = styled.div`
`;

const MaxButton = styled(Button)`
	padding: 0 8px !important;
	height: 18px !important;
	border-color: ${({ theme }) => theme.colors.borderSecondary};
	background: ${({ theme }) => theme.colors.bgPrimary};
	border-radius: 4px;
	${TEXT_TYPES_MAP[TEXT_TYPES.SUPPORTING]};
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

const CreateOrderInterface: React.FC<IProps> = observer(({ ...rest }) => {
	const { accountStore } = useStores();
	const vm = useTradeScreenVM();
	const [percent, _setPercent] = useState(0);

	const setPercent = (v: number) => {
		_setPercent(v);
		const balance = accountStore.findBalanceByAssetId(vm.isSell ? vm.assetId0 : vm.assetId1)?.balance;
		if (balance != null) {
			const value = balance.times(v / 100).toNumber();
			vm.isSell ? vm.setSellAmount(new BN(value), true) : vm.setBuyTotal(new BN(value), true);
		}
	};

	useEffect(() => {
		const balance = accountStore.findBalanceByAssetId(vm.isSell ? vm.assetId0 : vm.assetId1)?.balance;
		const value = vm.isSell ? vm.sellAmount : vm.buyTotal;
		if (balance != null) {
			balance.eq(0) ? _setPercent(0) : _setPercent(value.div(balance).times(100).toNumber());
		}
		/* eslint-disable */
	}, [accountStore.assetBalances, vm.assetId0, vm.assetId1, vm.buyTotal, vm.isSell, vm.sellAmount]);

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
						<Text disabled type={TEXT_TYPES.SUPPORTING}>
							About order type
						</Text>
					</Row>
				</Column>
				<SizedBox width={8} />
				<TokenInput
					decimals={vm.token1.decimals}
					amount={vm.isSell ? vm.sellPrice : vm.buyPrice}
					setAmount={(v) => (vm.isSell ? vm.setSellPrice(v, true) : vm.setBuyPrice(v, true))}
					label="Market price"
				/>
			</Row>
			<SizedBox height={2} />
			<Row alignItems="flex-end">
				<TokenInput
					assetId={vm.token0.assetId}
					decimals={vm.token0.decimals}
					amount={vm.isSell ? vm.sellAmount : vm.buyAmount}
					setAmount={(v) => (vm.isSell ? vm.setSellAmount(v, true) : vm.setBuyAmount(v, true))}
					error={vm.isSell ? vm.sellAmountError : undefined}
					// errorMessage="Insufficient amount"
					label="Order size"
				/>
				<SizedBox width={8} />
				<Column crossAxisSize="max" alignItems="flex-end">
					<MaxButton fitContent>MAX</MaxButton>
					<SizedBox height={4} />
					<TokenInput
						assetId={vm.token1.assetId}
						decimals={vm.token1.decimals}
						amount={vm.isSell ? vm.sellTotal : vm.buyTotal}
						setAmount={(v) => (vm.isSell ? vm.setSellTotal(v, true) : vm.setBuyTotal(v, true))}
						// errorMessage="Insufficient amount"
						error={vm.isSell ? undefined : vm.buyTotalError}
					/>
				</Column>
			</Row>
			<SizedBox height={4} />
			<Row alignItems="center" justifyContent="space-between">
				<Text type={TEXT_TYPES.SUPPORTING}>Available</Text>
				<Row alignItems="center" mainAxisSize="fit-content">
					<Text primary type={TEXT_TYPES.BODY}>
						{accountStore.findBalanceByAssetId(vm.isSell ? vm.assetId0 : vm.assetId1)?.formatBalance ?? "-"}
					</Text>
					<Text type={TEXT_TYPES.SUPPORTING}>&nbsp;{vm.isSell ? vm.token0.symbol : vm.token1.symbol}</Text>
				</Row>
			</Row>
			{/*<Button onClick={vm.setupMarketMakingAlgorithm}>Setup market making algorithm</Button>*/}
			<SizedBox height={28} />
			<Slider min={0} max={100} value={percent} percent={percent} onChange={(v) => setPercent(v as number)} step={1} />
			<SizedBox height={28} />
			<Accordion transition transitionTimeout={400}>
				<AccordionItem
					defaultChecked
					header={
						<Row justifyContent="space-between" mainAxisSize="stretch" alignItems="center">
							<Text nowrap primary type={TEXT_TYPES.BUTTON_SECONDARY}>
								Order Details
							</Text>
							<Row justifyContent="flex-end" alignItems="center">
								<Text primary>{BN.formatUnits(vm.isSell ? vm.sellAmount : vm.buyAmount, vm.token0.decimals).toFormat(2)}</Text>
								<Text>&nbsp;{vm.token0.symbol}</Text>
							</Row>
						</Row>
					}
					initialEntered
				>
					<Row alignItems="center" justifyContent="space-between">
						<Text nowrap>Max buy</Text>
						<Row justifyContent="flex-end" alignItems="center">
							<Text primary>{BN.formatUnits(vm.isSell ? vm.sellTotal : vm.buyTotal, vm.token1.decimals).toFormat(2)}</Text>
							<Text>&nbsp;{vm.token1.symbol}</Text>
						</Row>
					</Row>
					<SizedBox height={8} />
					<Row alignItems="center" justifyContent="space-between">
						<Text nowrap>Matcher Fee</Text>
						<Row justifyContent="flex-end" alignItems="center">
							<Text primary>0.000001</Text>
							<Text>&nbsp;ETH</Text>
						</Row>
					</Row>
					<SizedBox height={8} />
					<Row alignItems="center" justifyContent="space-between">
						<Text nowrap>Total amount</Text>
						<Row justifyContent="flex-end" alignItems="center">
							<Text primary>{BN.formatUnits(vm.isSell ? vm.sellAmount : vm.buyAmount, vm.token0.decimals).toFormat(2)}</Text>
							<Text>&nbsp;{vm.token0.symbol}</Text>
						</Row>
					</Row>
				</AccordionItem>
			</Accordion>
			<SizedBox height={16} />
			<Button
				green={!vm.isSell}
				red={vm.isSell}
				disabled={vm.loading ? true : vm.isSell ? !vm.canSell : !vm.canBuy}
				onClick={() => vm.createOrder(vm.isSell ? "sell" : "buy")}
			>
				{vm.loading ? "Loading..." : vm.isSell ? `Sell ${vm.token0.symbol}` : `Buy ${vm.token0.symbol}`}
			</Button>
		</Root>
	);
});
export default CreateOrderInterface;
