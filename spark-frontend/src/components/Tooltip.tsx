import styled from "@emotion/styled";
import React, { CSSProperties } from "react";
import { usePopperTooltip } from "react-popper-tooltip";
import { Config } from "react-popper-tooltip/dist/types";

interface IProps {
	content: string | JSX.Element;
	config?: Config;
	fixed?: boolean;
	containerStyles?: CSSProperties;
	children: React.ReactNode;
}

const Root = styled.div<{
	fixed?: boolean;
}>`
	display: flex;
	background: ${({ theme }) => `${theme.colors.bgSecondary}`};
	z-index: 2;
	box-sizing: border-box;
	padding: 8px 16px 12px;
	border-radius: 4px;
	height: auto;
	overflow-y: auto;
	width: 100%;
`;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
`;
const Children = styled.div`
	cursor: pointer;
	position: relative;
`;
const Tooltip: React.FC<IProps> = ({ containerStyles, children, content, config }) => {
	const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip({ ...config });
	return (
		<Container>
			<Children ref={setTriggerRef} style={{ ...containerStyles }}>
				{children}
				{visible && (
					<Root ref={setTooltipRef} {...getTooltipProps()}>
						{content}
					</Root>
				)}
			</Children>
		</Container>
	);
};
export default Tooltip;
