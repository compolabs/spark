import styled from "@emotion/styled";
import { Column, Row } from "@components/Flex";
import React, { ComponentProps, useState } from "react";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react";
import TokenInput from "@components/TokenInput";
import Button, { ButtonGroup } from "@components/Button";
import Select from "@components/Select";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { useStores } from "@stores";
import AccordionItem from "@components/AccordionItem";
import { Accordion } from "@szhsin/react-accordion";
import { usePerpTradeVM } from "@screens/TradeScreen/PerpTradeVm";
import Slider from "@components/Slider";
import BN from "@src/utils/BN";

interface IProps extends ComponentProps<any> {}

const Root = styled.div`
	padding: 12px;
`;
const Chip = styled.div`
	padding: 8px 10px;
	color: ${({ theme }) => theme.colors.textSecondary};
	${TEXT_TYPES_MAP[TEXT_TYPES.BODY]}
	border-radius: 4px;
	border: 1px solid ${({ theme }) => theme.colors.borderSecondary};
	background: ${({ theme }) => theme.colors.bgPrimary};
	box-sizing: border-box;
	margin-left: 8px;
	cursor: pointer;
`;

const MaxButton = styled(Button)`
	padding: 0 8px !important;
	height: 18px !important;
	border-color: ${({ theme }) => theme.colors.borderSecondary};
	background: ${({ theme }) => theme.colors.bgPrimary};
	border-radius: 4px;
	${TEXT_TYPES_MAP[TEXT_TYPES.SUPPORTING]};
`;

const orderTypes = [
	{ title: "Stop Market", key: "stopmarket", disabled: true },
	{ title: "Limit", key: "limit" },
	{ title: "Market", key: "market", disabled: true },
	{ title: "Stop Limit", key: "stoplimit", disabled: true },
	{ title: "Take Profit", key: "takeprofit", disabled: true },
	{ title: "Take Profit Limit", key: "takeprofitlimit", disabled: true },
];

const CreateOrderPerp: React.FC<IProps> = observer(({ ...rest }) => {
	const { accountStore, tradeStore } = useStores();
	const vm = usePerpTradeVM();
	const [leverage, _setLeverage] = useState(0);
	const setLeverage = (v: number) => {
		_setLeverage(v);
		const max = vm.maxAbsPositionSize?.long ?? BN.ZERO;
		//todo проверить почему не работает с BN
		const value = (max.toNumber() * v) / 100;
		vm.setOrderSize(new BN(value), true);
	};

	const orderDetails = [
		{ title: "Max buy", value: "0.00" },
		{ title: "Est. fee", value: "0.00" },
		{ title: "Total amount", value: "0.00" },
	];
	return (
		<Root {...rest}>
			<ButtonGroup>
				<Button active={!vm.isShort} onClick={() => vm.setIsShort(false)}>
					LONG
				</Button>
				<Button active={vm.isShort} onClick={() => vm.setIsShort(true)}>
					SHORT
				</Button>
			</ButtonGroup>
			<SizedBox height={16} />
			<Row>
				<Column crossAxisSize="max">
					<Select label="Order type" options={orderTypes} selected={orderTypes[1].key} onSelect={() => null} />
					<SizedBox height={2} />
				</Column>
				<SizedBox width={8} />
				<TokenInput decimals={vm.token1.decimals} amount={vm.price} setAmount={(v) => vm.setPrice(v, true)} label="Price" />
			</Row>
			<SizedBox height={2} />
			<Row alignItems="flex-end">
				<TokenInput
					assetId={vm.token0.assetId}
					decimals={vm.token0.decimals}
					amount={vm.orderSize}
					setAmount={vm.setOrderSize}
					label="Order size"
				/>
				<SizedBox width={8} />
				<Column crossAxisSize="max" alignItems="flex-end">
					<MaxButton fitContent onClick={() => vm.onMaxClick()}>
						MAX
					</MaxButton>
					<SizedBox height={4} />
					<TokenInput
						assetId={vm.token1.assetId}
						decimals={vm.token1.decimals}
						amount={vm.orderValue}
						setAmount={vm.setOrderValue}
					/>
				</Column>
			</Row>
			<SizedBox height={8} />
			<Accordion transition transitionTimeout={400}>
				<AccordionItem
					defaultChecked
					header={
						<Row justifyContent="space-between" mainAxisSize="stretch" alignItems="center">
							<Text nowrap primary type={TEXT_TYPES.BUTTON_SECONDARY}>
								Leverage
							</Text>
							<Row justifyContent="flex-end" alignItems="center">
								<Text primary>{vm.leverageSize}x</Text>
							</Row>
						</Row>
					}
					initialEntered
				>
					<Slider
						min={0}
						max={100}
						value={leverage}
						percent={leverage}
						onChange={(v) => setLeverage(v as number)}
						step={1}
					/>
					<SizedBox height={8} />
					<Row alignItems="center" justifyContent="flex-end">
						{/*<TokenInput decimals={vm.token1.decimals} amount={vm.price} setAmount={vm.setPrice} />*/}
						{[5, 10, 20].map((v) => (
							<Chip key={"chip" + v}>{v}x</Chip>
						))}
					</Row>
				</AccordionItem>
			</Accordion>
			<Accordion transition transitionTimeout={400}>
				<AccordionItem
					style={{ borderTop: "none" }}
					defaultChecked
					header={
						<Row justifyContent="space-between" mainAxisSize="stretch" alignItems="center">
							<Text nowrap primary type={TEXT_TYPES.BUTTON_SECONDARY}>
								Order Details
							</Text>
							<Row justifyContent="flex-end" alignItems="center"></Row>
						</Row>
					}
					initialEntered
				>
					{orderDetails.map(({ title, value }, index) => (
						<Row alignItems="center" justifyContent="space-between" key={title + index} style={{ marginBottom: 8 }}>
							<Text nowrap>{title}</Text>
							<Row justifyContent="flex-end" alignItems="center">
								<Text primary>{value}</Text>
							</Row>
						</Row>
					))}
				</AccordionItem>
			</Accordion>
			<SizedBox height={16} />
			<Button
				green={!vm.isShort}
				red={vm.isShort}
				// disabled={vm.loading ? true : vm.isShort ? !vm.canSell : !vm.canShort}
				onClick={() => vm.createOrder(vm.isShort ? "short" : "long")}
			>
				{vm.loading ? "Loading..." : vm.isShort ? `Short ${vm.token0.symbol}` : `Long ${vm.token0.symbol}`}
			</Button>
		</Root>
	);
});
export default CreateOrderPerp;
