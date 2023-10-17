import styled from "@emotion/styled";

/*
    Fonts:

    JetBrains Mono 500  = assets/fonts/JetBrainsMono-Medium.ttf
    Space Grotesk  500  = assets/fonts/SpaceGrotesk-Medium.ttf
    Space Grotesk  400  = assets/fonts/SpaceGrotesk-Regular.ttf
    Syne           500  = assets/fonts/Syne-Medium.ttf
    Syne           600  = assets/fonts/Syne-SemiBold.ttf
*/

export enum TEXT_TYPES {
	H1,
	H2,
	H3,

	BODY_LARGE,
	BODY_MEDIUM,
	BODY_SMALL,

	LABEL,
	BUTTON,

	NUMBER_LARGE,
	NUMBER_MEDIUM,
	NUMBER_SMALL,
}

interface IProps {
	type?: TEXT_TYPES;
	color?: string;
}

export const h1Style = `
font-family: Syne;
font-size: 13px;
font-style: normal;
font-weight: 600;
line-height: normal;
`;
export const h2Style = `
font-family: Syne;
font-size: 10px;
font-style: normal;
font-weight: 600;
line-height: normal;
letter-spacing: 1px;
`;
export const h3Style = `
font-family: Syne;
font-size: 10px;
font-style: normal;
font-weight: 500;
line-height: normal;
letter-spacing: 1px;
`;
export const bodyLargeStyle = `
font-family: Space Grotesk;
font-size: 12px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;
export const bodyMediumStyle = `
font-family: Space Grotesk;
font-size: 10px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;
export const bodySmallStyle = `
font-family: Space Grotesk;
font-size: 8px;
font-style: normal;
font-weight: 400;
line-height: normal;
`;
export const labelStyle = `
font-family: Space Grotesk;
font-size: 8px;
font-style: normal;
font-weight: 400;
line-height: normal;
letter-spacing: 1.12px;
`;
export const buttonStyle = `
font-family: Space Grotesk;
font-size: 8px;
font-style: normal;
font-weight: 500;
line-height: normal;
letter-spacing: 0.8px;
`;
export const numberLargeStyle = `
font-family: JetBrains Mono;
font-size: 16px;
font-style: normal;
font-weight: 500;
line-height: normal;
`;
export const numberMediumStyle = `
font-family: JetBrains Mono;
font-size: 12px;
font-style: normal;
font-weight: 500;
line-height: normal;
letter-spacing: 0.6px;
`;
export const numberSmallStyle = `
font-family: JetBrains Mono;
font-size: 10px;
font-style: normal;
font-weight: 500;
line-height: normal;
letter-spacing: 1px;
`;
export const TEXT_TYPES_MAP = {
	[TEXT_TYPES.H1]: h1Style,
	[TEXT_TYPES.H2]: h2Style,
	[TEXT_TYPES.H3]: h3Style,

	[TEXT_TYPES.BODY_LARGE]: bodyLargeStyle,
	[TEXT_TYPES.BODY_MEDIUM]: bodyMediumStyle,
	[TEXT_TYPES.BODY_SMALL]: bodySmallStyle,

	[TEXT_TYPES.LABEL]: labelStyle,
	[TEXT_TYPES.BUTTON]: buttonStyle,

	[TEXT_TYPES.NUMBER_LARGE]: numberLargeStyle,
	[TEXT_TYPES.NUMBER_MEDIUM]: numberMediumStyle,
	[TEXT_TYPES.NUMBER_SMALL]: numberSmallStyle,
};

const Text = styled.div<IProps>`
	cursor: default;
	color: ${({ color, theme }) => color ?? theme.colors.white};
	${({ type }) => (type != null ? TEXT_TYPES_MAP[type] : TEXT_TYPES_MAP[TEXT_TYPES.BODY_MEDIUM])}
`;
export default Text;
