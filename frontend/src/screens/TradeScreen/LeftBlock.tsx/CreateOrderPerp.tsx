import styled from "@emotion/styled";
import { Column, Row } from "@components/Flex";
import React, { ComponentProps, useState } from "react";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react";
import TokenInput from "@components/TokenInput";
import Button, { ButtonGroup } from "@components/Button";
import Select from "@components/Select";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import AccordionItem from "@components/AccordionItem";
import { Accordion } from "@szhsin/react-accordion";
import { usePerpTradeVM } from "@screens/TradeScreen/PerpTradeVm";
import Slider from "@components/Slider";
import BN from "@src/utils/BN";
import { useStores } from "@stores";

interface IProps extends ComponentProps<any> {}

const Root = styled.div`
	padding: 12px;
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
	{ title: "Limit", key: "limit" },
	{ title: "Market", key: "market" },
];

const CreateOrderPerp: React.FC<IProps> = observer(({ ...rest }) => {
	const { oracleStore } = useStores();
	const [orderTypeIndex, setOrderTypeIndex] = useState(0);
	const vm = usePerpTradeVM();

	let price = oracleStore?.prices != null ? new BN(oracleStore?.prices[vm.token0.priceFeed]?.price.toString()) : BN.ZERO;
	let marketPrice = BN.formatUnits(price, 2);
	const onChangePercent = (percent: number) => {
		const max = vm.maxAbsPositionSize?.long ?? BN.ZERO;
		const value = (max.toNumber() * percent) / 100;
		vm.setOrderSize(new BN(value), true);
	};

	const orderDetails = [
		{ title: "Order Size", value: `${vm.formattedOrderSize} ${vm.token0.symbol}` },
		{ title: "Est. fee", value: "0.00 ETH" },
		{ title: "Total amount", value: `${vm.formattedOrderValue} ${vm.token1.symbol}` },
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
					<Select
						label="Order type"
						options={orderTypes}
						selected={orderTypes[orderTypeIndex].key}
						onSelect={(_, index) => {
							setOrderTypeIndex(index);
							index === 1 && vm.setPrice(marketPrice);
						}}
					/>
					<SizedBox height={2} />
				</Column>
				<SizedBox width={8} />
				<TokenInput
					disabled={orderTypeIndex === 1}
					decimals={vm.token1.decimals}
					amount={vm.price}
					setAmount={(v) => vm.setPrice(v, true)}
					label={orderTypeIndex === 0 ? "Price" : "Market price"}
				/>
			</Row>
			<SizedBox height={2} />
			<Row alignItems="flex-end">
				<TokenInput
					assetId={vm.token0.assetId}
					decimals={vm.token0.decimals}
					amount={vm.orderSize}
					setAmount={vm.setOrderSize}
					max={vm.maxAbsPositionSize?.long}
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
								<Text primary>{vm.leverageSize.toFormat(2)}x</Text>
								{/*<Text primary>{vm.leverage.toFormat(2)}x</Text>*/}
							</Row>
						</Row>
					}
					initialEntered
				>
					<Slider
						min={0}
						max={100}
						symbol="x"
						fixSize={2}
						percent={vm.leverageSize.toNumber()}
						value={vm.leveragePercent}
						onChange={(v) => onChangePercent(v as number)}
						step={1}
					/>
					{/*<SizedBox height={8} />*/}
					{/*<Row alignItems="center" justifyContent="flex-end">*/}
					{/*	/!*<TokenInput decimals={vm.token1.decimals} amount={vm.price} setAmount={vm.setPrice} />*!/*/}
					{/*	{[5, 10, 20].map((v) => (*/}
					{/*		<Chip key={"chip" + v} onClick={() => vm.onLeverageClick(v)}>*/}
					{/*			{v}x*/}
					{/*		</Chip>*/}
					{/*	))}*/}
					{/*</Row>*/}
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
			<Button disabled={vm.loading || !vm.initialized} green={!vm.isShort} red={vm.isShort} onClick={vm.openOrder}>
				{vm.loading || !vm.initialized
					? "Loading..."
					: vm.isShort
					? `Short ${vm.token0.symbol}`
					: `Long ${vm.token0.symbol}`}
			</Button>
			<SizedBox height={16} />
			<Button onClick={vm.sergioTestCase}>call sergio btn</Button>
		</Root>
	);
});
export default CreateOrderPerp;
