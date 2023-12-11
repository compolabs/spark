import RCSlider, { SliderProps } from "rc-slider";
import { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import React from "react";
import styled from "@emotion/styled";
import { Row } from "@components/Flex";
import "rc-slider/assets/index.css";

interface IProps {
	percent?: number;
	symbol?: string;
	fixSize?: number;
}

const Dot = styled.div`
	width: 4px;
	height: 4px;
	border-radius: 50%;
	background: ${({ theme }) => theme.colors.iconSecondary};
	z-index: 1;
`;

const Root = styled.div`
	background: ${({ theme }) => theme.colors.bgPrimary};
	height: 24px;
	box-sizing: border-box;
	padding: 0 23px 0 25px;
	border-radius: 32px;
	position: relative;

	&::after {
		position: absolute;
		z-index: 1;
		left: 2px;
		top: 2px;
		bottom: 2px;
		content: "";
		-webkit-appearance: none;
		display: flex;
		height: 20px;
		box-sizing: border-box;
		width: 35px;
		cursor: pointer;
		border-radius: 32px;
		border: 1px solid ${({ theme }) => theme.colors.borderAccent};
		background: ${({ theme }) => theme.colors.bgSecondary};
	}
`;

const StyledSlider = styled(RCSlider)<IProps>`
	padding: 0;

	.rc-slider-rail {
		width: 100%;
		height: 24px;
		border-radius: 32px;
		outline: 0;
		background: ${({ theme }) => theme.colors.bgPrimary};
		z-index: 0;
	}

	.rc-slider-track {
		-webkit-appearance: none;
		height: 20px;
		cursor: pointer;
		top: 2px;
		border: 1px solid ${({ theme }) => theme.colors.borderAccent};
		border-left: none;
		border-radius: 0 32px 32px 0;
		background: ${({ theme }) => theme.colors.bgSecondary};
		z-index: 2;
	}

	.rc-slider-handle {
		z-index: 2;
		border: 1px solid ${({ theme }) => theme.colors.borderAccent};
		//border: 1px solid red;
		border-left: none;
		border-radius: 0 32px 32px 0;
		//border-radius: 32px;

		background: transparent;
		background: ${({ theme }) => theme.colors.bgSecondary};

		opacity: 1;
		-webkit-appearance: none;
		height: 20px;
		width: 35px;
		cursor: pointer;
		top: 7px;
		margin-left: 4px;

		&-dragging {
			border: 1px solid ${({ theme }) => theme.colors.borderAccent} !important;
			border-left: none !important;
			box-shadow: none !important;
		}

		&:focus-visible {
			box-shadow: none !important;
		}

		&::after {
			content: "${({ percent, symbol, fixSize }) =>
				`${percent !== 0 ? "<" : ""} ${percent?.toFixed(fixSize == null || percent === 0 ? 0 : fixSize)}${symbol ?? "%"} ${
					percent !== 100 ? ">" : " "
				} `}";
			height: 20px;
			position: absolute;
			top: 2px;
			right: 4px;
			white-space: nowrap;
			${TEXT_TYPES_MAP[TEXT_TYPES.BODY]};
		}
	}
`;

const DotsContainer = styled(Row)`
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;

	width: 100%;
	height: 24px;
	align-items: center;
	justify-content: space-around;
`;

const Slider: React.FC<SliderProps & IProps> = (props) => (
	<Root>
		<DotsContainer>
			{Array.from({ length: 10 }, (_, i) => (
				<Dot key={i} />
			))}
		</DotsContainer>
		<StyledSlider {...props} />
	</Root>
);
export default Slider;
