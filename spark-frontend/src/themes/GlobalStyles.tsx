import React from "react";
import { css, Global, useTheme } from "@emotion/react";

const globalStyles = (theme: any) => `
// PUT GLOBAL STYLED HERE
`;

const GlobalStyles: React.FC = () => {
	const theme = useTheme();
	return <Global styles={css(globalStyles(theme))} />;
};

export default GlobalStyles;
