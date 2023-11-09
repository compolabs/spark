import styled from "@emotion/styled";
import { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";

//TODO use colors from theme
type TTextColor = "green" | "red" | "outline" | "no-outline";

const Button = styled.button<{
	primary?: boolean;
	secondary?: boolean;
	fitContent?: boolean;
	color?: TTextColor;
}>`
	text-decoration: none;
	white-space: nowrap;
	display: flex;
	justify-content: center;
	align-items: center;
	box-sizing: border-box;
	${TEXT_TYPES_MAP[TEXT_TYPES.BUTTON]}
	height: 24px;
	padding: 12px 16px;
	border-radius: 32px;
	@media (min-width: 880px) {
		padding: 8px 12px;
		height: 32px;
	}
	${({ color, theme }) =>
		(() => {
			switch (color as any) {
				case "green":
					return `background: #004C2D; border: #00E388;`;
				case "red":
					return `background: #57011B; border: #E80247;`;
				case "outline":
					return `background: transparent; border: #969696;`;
				case "no-outline":
					return `background: #004C2D; border: #00E388;`;
				default:
					return `background: transparent; border: #969696;`;
			}
		})()}
`;

export default Button;

export const ButtonGroup = styled.div`
	display: flex;
	width: 100%;
	box-sizing: border-box;

	& > button {
		height: 44px;
		border-radius: 0;
		${TEXT_TYPES_MAP[TEXT_TYPES.BUTTON]}
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
