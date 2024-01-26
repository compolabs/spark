import styled from "@emotion/styled";

import Text from "@components/Text";

interface IProps {
  active?: boolean;
  disabled?: boolean;
}

const Tab = styled(Text)<IProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  padding: 8px 4px;
  cursor: ${({ theme, disabled }) => (disabled ? "not-allowed" : "pointer")};
  color: ${({ theme, active, disabled }) =>
    active ? theme.colors.textPrimary : !disabled ? theme.colors.textSecondary : theme.colors.textDisabled};
  border-bottom: 2px solid ${({ theme, active }) => (active ? theme.colors.textPrimary : "transparent")};
  transition: 0.4s;

  :hover {
    color: ${({ theme, disabled }) => (!disabled ? theme.colors.textPrimary : theme.colors.textDisabled)};
  }
`;

export default Tab;
