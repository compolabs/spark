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
import TokenInput from "@components/TokenInput/TokenInput";
import Slider from "@components/Slider";
import Button from "@components/Button";
import { useStores } from "@stores";

interface IProps {
  onClose: () => void;
  visible: boolean;
  initAction: 0 | 1;
}

const OrderModal: React.FC<IProps> = ({ ...rest }) => {
  const vm = useTradeVM();
  const { accountStore, settingsStore } = useStores();
  const [percent, setPercent] = useState<number | number[]>(100);
  const [action, setAction] = useState<0 | 1>(rest.initAction);
  return (
    <Dialog
      style={{ maxWidth: 360 }}
      bodyStyle={{ minHeight: 440 }}
      title="Place Order"
      {...rest}
    >
      <SwitchButtons
        values={["Buy", "Sell"]}
        active={action}
        onActivate={setAction}
        border
      />
      <SizedBox height={24} />
      <Row alignItems="center" justifyContent="flex-end">
        <Img src={wallet} alt="wallet" />
        <SizedBox width={4} />
        <Text fitContent>0.001 {vm.token0.symbol}</Text>
      </Row>
      <SizedBox height={24} />
      <TokenInput
        description="Price"
        decimals={vm.token0.decimals}
        amount={vm.amount0}
        setAmount={vm.setAmount0}
        assetId={vm.assetId0}
      />
      <SizedBox height={12} />
      <TokenInput
        description="Amount"
        decimals={vm.token0.decimals}
        amount={vm.amount0}
        setAmount={vm.setAmount0}
        assetId={vm.assetId0}
      />
      <SizedBox height={12} />
      <Slider
        min={0}
        max={100}
        step={1}
        marks={{ 0: 0, 25: 25, 50: 50, 75: 75, 100: 100 }}
        value={percent}
        onChange={setPercent}
      />
      <SizedBox height={12} />
      <TokenInput
        description="Total"
        decimals={vm.token0.decimals}
        amount={vm.amount0}
        setAmount={vm.setAmount0}
        assetId={vm.assetId0}
      />
      <SizedBox height={12} />
      {accountStore.isLoggedIn ? (
        <Button kind={action === 0 ? "green" : "danger"} fixed>
          {`${action === 0 ? "Buy" : "Sell"} ${vm.token1.symbol}`}
        </Button>
      ) : (
        <Button fixed onClick={() => settingsStore.setLoginModalOpened(true)}>
          Connect wallet
        </Button>
      )}
    </Dialog>
  );
};

export default observer(OrderModal);
