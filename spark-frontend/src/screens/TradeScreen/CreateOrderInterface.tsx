import styled from "@emotion/styled";
import { Column } from "@src/components/Flex";
import React, { useState } from "react";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react";
import { useTradeScreenVM } from "@screens/TradeScreen/TradeScreenVm";
import TokenInput from "@components/TokenInput";
import Button, { ButtonGroup } from "@components/Button";
import { TOKENS_BY_SYMBOL } from "@src/constants";
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
	const [orderType, setOrderType] = useState<any>(orderTypes[0]);

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
				<Select label="Order type" options={orderTypes} selected={orderType} onSelect={(v) => setOrderType(v)} />

				<SizedBox height={16} />
				<TokenInput
					assetId={TOKENS_BY_SYMBOL.ETH.assetId}
					decimals={TOKENS_BY_SYMBOL.ETH.decimals}
					amount={vm.isSell ? vm.sellPrice : vm.buyPrice}
					setAmount={(v) => (vm.isSell ? vm.setSellPrice(v, true) : vm.setBuyPrice(v, true))}
					label="MARKET PRICE"
				/>
				<SizedBox height={16} />
				<TokenInput
					decimals={vm.token0.decimals}
					amount={vm.isSell ? vm.sellAmount : vm.buyAmount}
					setAmount={(v) => (vm.isSell ? vm.setSellAmount(v, true) : vm.setBuyAmount(v, true))}
					assetId={vm.assetId0}
					error={vm.isSell ? vm.sellAmountError : undefined}
					label="ORDER SIZE (UNI)"
				/>
				<SizedBox height={16} />
				<TokenInput
					label="ORDER SIZE (USDC)"
					decimals={vm.token1.decimals}
					amount={vm.isSell ? vm.sellTotal : vm.buyTotal}
					setAmount={(v) => (vm.isSell ? vm.setSellTotal(v, true) : vm.setBuyTotal(v, true))}
					assetId={vm.assetId1}
					error={vm.isSell ? undefined : vm.buyTotalError}
				/>
			</Column>
			<Button primary={!vm.isSell} secondary={vm.isSell} onClick={() => vm.createOrder(vm.isSell ? "sell" : "buy")}>
				{vm.isSell ? "Sell" : "Buy"}
			</Button>
		</Root>
	);
});
export default CreateOrderInterface;
