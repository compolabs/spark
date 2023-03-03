import React, { useState } from "react";
import Dialog from "@components/Dialog";
import { useTradeVM } from "@screens/Trade/TradeVm";
import { observer } from "mobx-react-lite";
import SwitchButtons from "@src/components/SwitchButtons";
import SizedBox from "@src/components/SizedBox";
import { Row } from "@components/Flex";
import Text from "@components/Text";
import Img from "@components/Img";
import wallet from "@src/assets/icons/wallet.svg";
import Button from "@components/Button";
import { useStores } from "@stores";
import TokenInput from "@src/components/TokenInput";

interface IProps {
  onClose: () => void;
  visible: boolean;
}

const OrderModal: React.FC<IProps> = ({ ...rest }) => {
  const vm = useTradeVM();
  const { accountStore, settingsStore } = useStores();
  const balance0 = accountStore.getFormattedBalance(vm.token0);
  const balance1 = accountStore.getFormattedBalance(vm.token1);
  return (
    <Dialog style={{ maxWidth: 360 }} title="Place Order" {...rest}>
      <SwitchButtons
        values={["Buy", "Sell"]}
        active={vm.activeModalAction}
        onActivate={vm.setActiveModalAction}
        border
      />
      <SizedBox height={24} />
      <Row alignItems="center" justifyContent="space-between">
        <Text>
          {vm.activeModalAction === 0
            ? `Buy ${vm.token0.symbol}`
            : `Sell ${vm.token0.symbol}`}
        </Text>
        {accountStore.isLoggedIn && (
          <Row alignItems="center" justifyContent="flex-end">
            <Img src={wallet} alt="wallet" />
            <SizedBox width={4} />
            <Text nowrap fitContent>
              {vm.activeModalAction === 1
                ? `${balance0} ${vm.token0.symbol}`
                : `${balance1} ${vm.token1.symbol}`}
            </Text>
          </Row>
        )}
      </Row>
      <SizedBox height={24} />
      <TokenInput
        description="Price"
        decimals={vm.token1.decimals}
        amount={vm.activeModalAction === 0 ? vm.buyPrice : vm.sellPrice}
        setAmount={(v) =>
          vm.activeModalAction === 0
            ? vm.setBuyPrice(v, true)
            : vm.setSellPrice(v, true)
        }
        assetId={vm.assetId1}
      />
      <SizedBox height={12} />
      <TokenInput
        description="Amount"
        decimals={vm.token0.decimals}
        amount={vm.activeModalAction === 0 ? vm.buyAmount : vm.sellAmount}
        setAmount={(v) =>
          vm.activeModalAction === 0
            ? vm.setBuyAmount(v, true)
            : vm.setSellAmount(v, true)
        }
        assetId={vm.assetId0}
        error={vm.activeModalAction === 1 ? vm.sellAmountError : false}
      />
      <SizedBox height={12} />
      <TokenInput
        description="Total"
        decimals={vm.token1.decimals}
        amount={vm.activeModalAction === 0 ? vm.buyTotal : vm.sellTotal}
        setAmount={(v) =>
          vm.activeModalAction === 0
            ? vm.setBuyTotal(v, true)
            : vm.setSellTotal(v, true)
        }
        assetId={vm.assetId1}
        error={vm.activeModalAction === 0 ? vm.buyTotalError : false}
      />
      <SizedBox height={12} />
      <SizedBox height={12} />
      {accountStore.isLoggedIn ? (
        <Button
          kind={vm.activeModalAction === 0 ? "green" : "danger"}
          fixed
          disabled={vm.activeModalAction === 0 ? !vm.canBuy : !vm.canSell}
          onClick={() =>
            vm.activeModalAction === 0
              ? vm.createOrder("buy")
              : vm.createOrder("sell")
          }
        >
          {`${vm.activeModalAction === 0 ? "Buy" : "Sell"} ${vm.token1.symbol}`}
        </Button>
      ) : (
        <Button fixed onClick={() => settingsStore.setLoginModalOpened(true)}>
          Connect wallet
        </Button>
      )}
      <SizedBox height={24} />
    </Dialog>
  );
};

export default observer(OrderModal);
