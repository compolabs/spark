import styled from "@emotion/styled";
import { Column, Row } from "@src/components/Flex";
import React, { ComponentProps } from "react";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react";
import { useTradeScreenVM } from "@screens/TradeScreen/TradeScreenVm";
import TokenInput from "@components/TokenInput";
import Button, { ButtonGroup } from "@components/Button";
import Select from "@components/Select";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { ReactComponent as InfoIcon } from "@src/assets/icons/info.svg";
import { useStores } from "@stores";

interface IProps extends ComponentProps<any> {}

const Root = styled.div`
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	padding: 12px;
	flex: 2;
	max-width: 280px;
	height: 100%;
	border-radius: 10px;
	background: ${({ theme }) => theme.colors.gray4};
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

const CreateOrderInterface: React.FC<IProps> = observer(({ ...rest }) => {
	const vm = useTradeScreenVM();
	const { accountStore } = useStores();
	const orderTypes = [
		{ title: "Spot market", key: "market" },
		{ title: "Perpetual market", key: "perps", disabled: true },
	];
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
					<Select disabled label="Order type" options={orderTypes} selected={orderTypes[0]} onSelect={() => null} />
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
					errorMessage="Insufficient amount"
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
						errorMessage="Insufficient amount"
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
