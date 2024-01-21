import styled from "@emotion/styled";
import React from "react";

interface IProps {
	onClick: () => void;
	opened: boolean;
}

const Root = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 32px;
	border: 1px solid ${({ theme }) => theme.colors.borderPrimary};

	width: 40px;
	height: 40px;

	.menu-icon {
		transform: scale(1.5);
	}

	.menu-icon {
		position: relative;
		width: 13px;
		height: 13px;
		cursor: pointer;

		.menu-icon__cheeckbox {
			display: block;
			width: 100%;
			height: 100%;
			position: relative;
			cursor: pointer;
			z-index: 2;
			-webkit-touch-callout: none;
			position: absolute;
			opacity: 0;
		}

		div {
			margin: auto;
			position: absolute;
			top: 0;
			right: 0;
			left: 0;
			bottom: 0;
			//width: 22px;
			height: 6px;
		}

		span {
			position: absolute;
			display: block;
			width: 100%;
			height: 1px;
			background: ${({ theme }) => theme.colors.iconPrimary};
			border-radius: 4px;
			transition: all 0.2s cubic-bezier(0.1, 0.82, 0.76, 0.965);

			&:first-of-type {
				top: 0;
			}

			&:last-of-type {
				bottom: 1px;
			}
		}

		&.active,
		.menu-icon__cheeckbox:checked + div {
			span {
				&:first-of-type {
					transform: rotate(45deg);
					top: 3px;
				}

				&:last-of-type {
					transform: rotate(-45deg);
					bottom: 2px;
				}
			}
		}
	}
`;

const MobileMenuIcon: React.FC<IProps> = ({ opened, onClick }) => {
	return (
		<Root onClick={onClick}>
			<div className="menu-icon">
				<input className="menu-icon__cheeckbox" type="checkbox" checked={opened} onChange={onClick} />
				<div>
					<span></span>
					<span></span>
				</div>
			</div>
		</Root>
	);
};
export default MobileMenuIcon;
