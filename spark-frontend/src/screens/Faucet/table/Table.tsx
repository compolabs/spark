import styled from "@emotion/styled";

import { Row } from "@components/Flex";
import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";

export const TableRow = styled(Row)`
	margin-bottom: 1px;
	height: 32px;
	flex-shrink: 0;
	background: ${({ theme }) => theme.colors.bgPrimary};
	align-items: center;
	padding: 0 12px;
	box-sizing: border-box;

	:last-of-type {
		margin-bottom: 0;
	}
`;

export const StyledTableRow = styled(TableRow)`
	height: 48px;
`;
export const TableTitle = styled(Text)`
	flex: 1;
	white-space: nowrap;
	${TEXT_TYPES_MAP[TEXT_TYPES.SUPPORTING]}
`;

export const TableText = styled(Text)`
	flex: 1;
	display: flex;
	align-items: center;
`;
