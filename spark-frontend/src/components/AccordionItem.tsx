import React from "react";
import styled from "@emotion/styled";
import { AccordionItem as RawAccordionItem } from "@szhsin/react-accordion";
import { AccordionItemProps } from "@szhsin/react-accordion/types/components/AccordionItem";

import { ReactComponent as ArrowIcon } from "@src/assets/icons/arrowUp.svg";

const AccordionItemRoot = styled(RawAccordionItem)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSecondary};

  :first-of-type {
    border-top: 1px solid ${({ theme }) => theme.colors.borderSecondary};
  }

  .itemBtn {
    cursor: pointer;
    display: flex;
    align-items: center;
    width: 100%;
    margin: 0;
    padding: 12px 0;
    background-color: transparent;
    border: none;
  }

  .itemContent {
    transition: height 0.25s cubic-bezier(0, 0, 0, 1);
  }

  .itemPanel {
    box-sizing: border-box;
    padding-bottom: 12px;
  }

  .arrow {
    margin-left: auto;
    transition: transform 0.25s cubic-bezier(0, 0, 0, 1);
  }

  .itemBtn:hover .arrow {
    transform: rotate(-90deg);
  }

  .itemBtnExpanded .arrow {
    transform: rotate(-180deg) !important;
  }
`;

const AccordionItem: React.FC<AccordionItemProps> = ({ header, ...rest }) => (
  <AccordionItemRoot
    {...rest}
    buttonProps={{
      className: ({ isEnter }) => `itemBtn ${isEnter && "itemBtnExpanded"}`,
    }}
    className="item"
    contentProps={{ className: "itemContent" }}
    header={
      <>
        {header}
        <ArrowIcon className="arrow" />
      </>
    }
    panelProps={{ className: "itemPanel" }}
  />
);

export default AccordionItem;
