import styled from "@emotion/styled";
import { Column } from "@src/components/Flex";
import React from "react";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react";
import { useTradeScreenVM } from "@screens/TradeScreen/TradeScreenVm";
import TokenInput from "@components/TokenInput";
import Button, { ButtonGroup } from "@components/Button";
import Select from "@components/Select";

interface IProps {}

const Root = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	border: 1px solid white;
	box-sizing: border-box;
	padding: 16px;
	flex: 2;
	height: 100%;
	border-radius: 10px;
	background: ${({ theme }) => theme.colors.gray4};
`;

const CreateOrderInterface: React.FC<IProps> = observer(() => {
	const vm = useTradeScreenVM();
	const orderTypes = [
		{ title: "Spot market", key: "market" },
		{ title: "Perps", key: "perps" }
	];

	return (
		<Root>
			<Column crossAxisSize="max">
				<ButtonGroup>
					<Button primary={!vm.isSell} outline={vm.isSell} onClick={() => vm.setIsSell(false)}>
						Buy
					</Button>
					<Button secondary={vm.isSell} outline={!vm.isSell} onClick={() => vm.setIsSell(true)}>
						Sell
					</Button>
				</ButtonGroup>
				<SizedBox height={32} />
				<Select label="Order type" options={orderTypes} selected={orderTypes[0]} onSelect={() => null} />

				<SizedBox height={16} />
				<TokenInput
					assetId={vm.isSell ? vm.token1.assetId : vm.token0.assetId}
					decimals={vm.isSell ? vm.token1.decimals : vm.token0.decimals}
					amount={vm.isSell ? vm.sellPrice : vm.buyPrice}
					setAmount={(v) => (vm.isSell ? vm.setSellPrice(v, true) : vm.setBuyPrice(v, true))}
					label="PRICE"
				/>
				<SizedBox height={16} />
				<TokenInput
					assetId={!vm.isSell ? vm.token1.assetId : vm.token0.assetId}
					decimals={!vm.isSell ? vm.token1.decimals : vm.token0.decimals}
					amount={vm.isSell ? vm.sellAmount : vm.buyAmount}
					setAmount={(v) => (vm.isSell ? vm.setSellAmount(v, true) : vm.setBuyAmount(v, true))}
					error={vm.isSell ? vm.sellAmountError : undefined}
					errorMessage="Insufficient amount"
					label="AMOUNT"
				/>
				<SizedBox height={16} />
				<TokenInput
					assetId={vm.isSell ? vm.token1.assetId : vm.token0.assetId}
					decimals={vm.isSell ? vm.token1.decimals : vm.token0.decimals}
					amount={vm.isSell ? vm.sellTotal : vm.buyTotal}
					setAmount={(v) => (vm.isSell ? vm.setSellTotal(v, true) : vm.setBuyTotal(v, true))}
					errorMessage="Insufficient amount"
					error={vm.isSell ? undefined : vm.buyTotalError}
					label="TOTAL"
				/>
			</Column>
			<Button
				primary={!vm.isSell}
				secondary={vm.isSell}
				disabled={vm.isSell ? !vm.canSell : !vm.canBuy}
				onClick={() => vm.createOrder(vm.isSell ? "sell" : "buy")}
			>
				{vm.isSell ? "Sell" : "Buy"}
			</Button>
		</Root>
	);
});
export default CreateOrderInterface;
