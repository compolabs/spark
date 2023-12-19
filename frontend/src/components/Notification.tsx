import styled from "@emotion/styled";
import React from "react";
import { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";

interface IProps {
	type?: "info" | "error";
	text: string;
}

const Root = styled.div<{ type: "info" | "error" }>`
	display: flex;
	flex-direction: column;
	${TEXT_TYPES_MAP[TEXT_TYPES.SUPPORTING]};
	font-weight: 500;
	background-image: linear-gradient(
		to right,
		${({ theme, type }) => (type === "info" ? theme.colors.attention : theme.colors.redLight)},
		transparent
	);
	border-radius: 4px 0 0 4px;
	padding: 8px 16px;
`;

const Notification: React.FC<IProps> = ({ text, type }) => {
	return <Root type={type ?? "info"}>{text}</Root>;
};
export default Notification;
