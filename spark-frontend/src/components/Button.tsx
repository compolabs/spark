import styled from "@emotion/styled";
import { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";
import { css } from "@emotion/react";

const Button = styled.button<{
	green?: boolean;
	red?: boolean;
	text?: boolean;
	fitContent?: boolean;
	//этот active и &:active отлтчаются: это состояние нажатой кнопки, а &:active - это цвеь в момент нажатия
	active?: boolean;
}>`
	text-decoration: none;
	white-space: nowrap;
	display: flex;
	justify-content: center;
	align-items: center;
	box-sizing: border-box;
	${TEXT_TYPES_MAP[TEXT_TYPES.BUTTON]}
	height: 40px;
	padding: 0 16px;
	border-radius: 32px;
	cursor: pointer;
	background: transparent;
	transition: 0.4s;
	width: ${({ fitContent }) => (fitContent ? "fit-content" : "100%")};
	color: ${({ theme }) => theme.colors.textPrimary};
	@media (min-width: 880px) {
		padding: 0 12px;
		height: 32px;
	}

	${({ green, red, text, theme, active }) =>
		(() => {
			switch (true) {
				case green:
					return css`
						border: 1px solid ${theme.colors.greenLight};
						background: ${active ? theme.colors.greenMedium : theme.colors.greenDark};

						&:hover {
							background: ${theme.colors.greenMedium};
						}

						&:active {
							background: ${theme.colors.greenDark};
						}

						&:disabled {
							border-color: ${theme.colors.borderSecondary};
							background: ${theme.colors.borderSecondary};
							color: ${theme.colors.textDisabled};
						}
					`;
				case red:
					return css`
						border: 1px solid ${theme.colors.redLight};
						background: ${active ? theme.colors.redMedium : theme.colors.redDark};

						&:hover {
							background: ${theme.colors.redMedium};
						}

						&:active {
							background: ${theme.colors.redDark};
						}

						&:disabled {
							border-color: ${theme.colors.borderSecondary};
							background: ${theme.colors.borderSecondary};
							color: ${theme.colors.textDisabled};
						}
					`;
				case text:
					return css`
						color: ${active ? theme.colors.textPrimary : theme.colors.textSecondary};
						border: 0;

						&:hover {
							color: ${theme.colors.textPrimary};
						}

						&:active {
							color: ${theme.colors.textPrimary};
						}

						&:disabled {
							color: ${theme.colors.textDisabled};
						}
					`;
				default:
					return css`
						border: 1px solid ${active ? theme.colors.borderAccent : theme.colors.borderPrimary};
						color: ${active ? theme.colors.textPrimary : theme.colors.textSecondary};

						&:hover {
							border: 1px solid ${theme.colors.borderAccent};
							color: ${theme.colors.textPrimary};
						}

						&:active {
							color: ${theme.colors.textPrimary};
						}

						&:disabled {
							border-color: ${theme.colors.borderSecondary};
							color: ${theme.colors.textDisabled};
						}
					`;
			}
		})()}
	&:disabled {
		cursor: not-allowed;
	}
`;

export default Button;

export const ButtonGroup = styled.div`
	display: flex;
	width: 100%;
	box-sizing: border-box;

	& > button {
		height: 32px;
		border-radius: 0;

		${TEXT_TYPES_MAP[TEXT_TYPES.BUTTON_SECONDARY]}
		:hover {
			background: ${({ theme }) => theme.colors.borderPrimary};
		}

		:disabled {
			background: transparent;
		}

		:active {
			background: transparent;
		}
	}

	& > :first-of-type {
		border-radius: 10px 0 0 10px;
	}

	& > :last-of-type {
		border-radius: 0 10px 10px 0;
	}
`;
// text-decoration: none;
// white-space: nowrap;
// display: flex;
// justify-content: center;
// align-items: center;
// box-sizing: border-box;
// 	transition: 0.4s;
// 	height: ${({ outline }) => (outline ? 26 : 32)}px;
// 	border-radius: 100px;
// 	box-shadow: none;
// 	color: ${({ outline, theme }) => (outline ? theme.colors.gray1 : theme.colors.white)};
// 	${({ outline }) => (outline ? TEXT_TYPES_MAP[TEXT_TYPES.BUTTON] : TEXT_TYPES_MAP[TEXT_TYPES.H1])}
// 	width: ${({ fitContent }) => (fitContent ? "fit-content" : "100%")};
// 	padding: 0 12px;
// 	outline: none;
//
// 	border: 1px solid
// 		${({ theme, primary, secondary, outline }) => {
// 			if (primary) return theme.colors.green;
// 			else if (secondary) return theme.colors.red;
// 			else if (outline) return theme.colors.gray3;
// 			else return theme.colors.gray1;
// 		}};
// 	opacity: 0.9;
// 	background-color: ${({ primary, secondary, outline, theme }) => {
// 		if (primary) return "rgba(0, 255, 152, 0.10)";
// 		else if (secondary) return "rgba(253, 10, 83, 0.10)";
// 		else if (outline) return theme.colors.gray5;
// 		else return "rgba(255, 255, 253, 0.10)";
// 	}};
//
// 	path {
// 		transition: 0.4s;
// 		fill: ${({ outline, theme }) => (outline ? theme.colors.gray1 : theme.colors.white)};
// 	}
//
// 	:active {
// 		path {
// 			fill: ${({ theme }) => theme.colors.white};
// 		}
//
// 		color: ${({ theme }) => theme.colors.white};
// 	}
//
// 	:hover {
// 		background-color: ${({ primary, secondary, outline, theme }) => {
// 			if (primary) return "rgba(0, 255, 152, 0.40)";
// 			else if (secondary) return "rgba(253, 10, 83, 0.40)";
// 			else if (outline) return theme.colors.gray5;
// 			else return "rgba(255, 255, 253, 0.40)";
// 		}};
// 		border: 1px solid
// 			${({ theme, primary, secondary, outline }) => {
// 				if (primary) return theme.colors.green;
// 				else if (secondary) return theme.colors.red;
// 				else if (outline) return theme.colors.gray2;
// 				else return theme.colors.gray1;
// 			}};
// 		cursor: pointer;
// 	}
//
// 	:disabled {
// 		border: ${({ outline, theme }) => (outline ? `1px solid ${theme.colors.gray3}` : 0)};
// 		background-color: ${({ primary, secondary, outline, theme }) => {
// 			if (primary) return "rgba(0, 255, 152, 0.10)";
// 			else if (secondary) return "rgba(253, 10, 83, 0.10)";
// 			else if (outline) return theme.colors.gray5;
// 			else return "rgba(255, 255, 253, 0.10)";
// 		}};
// 		opacity: 0.4;
// 		cursor: not-allowed;
// 	}
