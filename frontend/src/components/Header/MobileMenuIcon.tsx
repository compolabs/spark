import styled from "@emotion/styled";
import React, { ReactNode } from "react";

interface IProps {
	onClick?: () => void;
	opened?: boolean;
	customIcon?: ReactNode;
}

export const DefaultIcon: React.FC<{ className?: string }> = ({ className }) => (
	<>
		<span className={className}></span>
		<span className={className}></span>
	</>
);

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

        .icon-container {
            margin: auto;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .custom-icon {
            width: 100%;
            height: 100%;
        }

        &.active,
        .menu-icon__cheeckbox:checked + div {
            .custom-icon {
                transform: rotate(45deg);
            }
        }
    }
`;


const MobileMenuIcon: React.FC<IProps> = ({ opened, onClick, customIcon }) => {
	const IconComponent = customIcon || DefaultIcon;

	return (
		<Root onClick={onClick}>
			<div className="menu-icon">
				<input className="menu-icon__cheeckbox" type="checkbox" checked={opened} onChange={onClick} />
				<div>
					{typeof IconComponent === "function" ? <IconComponent className="custom-icon" /> : IconComponent}
				</div>
			</div>
		</Root>
	);
};

export default MobileMenuIcon;
