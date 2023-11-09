import styled from "@emotion/styled";

/*
    Fonts:

    JetBrains Mono 500  = assets/fonts/JetBrainsMono-Medium.ttf
    JetBrains Mono 400  = assets/fonts/JetBrainsMono-Regular.ttf
    Space Grotesk  500  = assets/fonts/SpaceGrotesk-Medium.ttf
    Space Grotesk  400  = assets/fonts/SpaceGrotesk-Regular.ttf
*/

type TTextColor = "primary" | "secondary" | "disabled";

export enum TEXT_TYPES {
	H,
	BODY,
	BUTTON,
	BUTTON_SECONDARY,
	SUPPORTING,
}

interface IProps {
	type?: TEXT_TYPES;
	color?: TTextColor;
}

//todo уточнить про font-variant-numeric:

export const hStyle = `
font-family: JetBrains Mono;
font-size: 14px;
font-style: normal;
font-weight: 500;
line-height: 16px;
`;
export const bodyStyle = `
font-family: JetBrains Mono;
font-size: 10px;
font-style: normal;
font-weight: 400;
line-height: 14px;
letter-spacing: 0.2px;
`;
export const buttonStyle = `
font-family: Space Grotesk;
font-size: 12px;
font-style: normal;
font-weight: 500;
line-height: 16px;
`;
export const buttonSecondaryStyle = `
font-family: Space Grotesk;
font-size: 10px;
font-style: normal;
font-weight: 500;
line-height: 16px; 
text-transform: uppercase;
`;
export const supportStyle = `
font-family: Space Grotesk;
font-size: 10px;
font-style: normal;
font-weight: 400;
line-height: 10px; 
letter-spacing: 0.2px;
`;
export const TEXT_TYPES_MAP = {
	[TEXT_TYPES.H]: hStyle,
	[TEXT_TYPES.BODY]: bodyStyle,
	[TEXT_TYPES.BUTTON]: buttonStyle,
	[TEXT_TYPES.BUTTON_SECONDARY]: buttonSecondaryStyle,
	[TEXT_TYPES.SUPPORTING]: supportStyle,
};

const Text = styled.div<IProps>`
	${({ type, theme }) =>
		(() => {
			switch (type as any) {
				case "primary":
					return `color: ${theme.colors?.textPrimary};`;
				case "secondary":
					return `color: ${theme.colors?.textSecondary};`;
				case "disabled":
					return `color: ${theme.colors?.textDisabled};`;
				default:
					return `color: ${theme.colors?.textSecondary};`;
			}
		})()}
	${({ type }) => (type != null ? TEXT_TYPES_MAP[type] : TEXT_TYPES_MAP[TEXT_TYPES.BODY])}
`;
export default Text;
