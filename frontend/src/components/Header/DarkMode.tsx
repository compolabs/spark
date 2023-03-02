import styled from "@emotion/styled";
import React, { HTMLAttributes } from "react";
import Text from "@components/Text";
import Switch from "@components/Switch";
import { observer } from "mobx-react-lite";
import { useStores } from "@stores";
import { THEME_TYPE } from "@src/themes/ThemeProvider";

interface IProps extends HTMLAttributes<HTMLDivElement> {
  text?: boolean;
}

const Root = styled.div`
  display: flex;
  border-radius: 12px;
  gap: 11px;
  align-items: center;
`;

const DarkMode: React.FC<IProps> = ({ text, ...rest }) => {
  const { settingsStore } = useStores();
  return (
    <Root {...rest}>
      {text && <Text>Dark mode</Text>}
      <Switch
        onChange={() => settingsStore.toggleTheme()}
        value={settingsStore.selectedTheme === THEME_TYPE.DARK_THEME}
      />
    </Root>
  );
};
export default observer(DarkMode);
