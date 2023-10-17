import styled from "@emotion/styled";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";

const Chip = styled(Text)`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 18px;
  border-radius: 4px;
  ${TEXT_TYPES_MAP[TEXT_TYPES.LABEL]}
  color: ${({ theme }) => theme.colors.gray2};
  background: ${({ theme }) => theme.colors.gray4};
  padding: 4px;
  box-sizing: border-box;
}
`;

export default Chip;
