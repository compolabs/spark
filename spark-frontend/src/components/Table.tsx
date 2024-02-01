import React from "react";
import { HeaderGroup, TableProps, useTable } from "react-table";
import styled from "@emotion/styled";

import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";

import { SmartFlex } from "./SmartFlex";
import Tooltip from "./Tooltip";

interface IProps extends TableProps {
  columns: any[];
  data: any[];
  fitContent?: boolean;
  withHover?: boolean;
  onClick?: () => void;
  loading?: boolean;
}

const Table: React.FC<IProps> = ({ columns, data, onClick, fitContent, withHover, loading, ...rest }) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });

  const renderTooltip = (header: HeaderGroup) => {
    const tooltipContent = (header as any).tooltip;
    const headerContent = header.render("Header");

    if (!tooltipContent) {
      return headerContent;
    }

    return (
      <Tooltip
        config={{
          placement: "right-start",
          trigger: "hover",
        }}
        containerStyles={{ width: "fit-content" }}
        content={
          <SmartFlex gap="4px" padding="4px 8px" width="300px" column>
            {tooltipContent}
          </SmartFlex>
        }
      >
        <HeaderWithTooltip>{headerContent}</HeaderWithTooltip>
      </Tooltip>
    );
  };

  return (
    <Root {...rest} fitContent={fitContent} hovered={withHover}>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup, index) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={index + "tr-header"}>
              {headerGroup.headers.map((column, index) => (
                <th {...column.getHeaderProps()} key={index + "th"}>
                  {renderTooltip(column)}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr
                style={{
                  opacity: row.original.disabled ? 0.5 : 1,
                  cursor: row.original.disabled ? "not-allowed" : "pointer",
                }}
                {...row.getRowProps()}
                key={i + "tr"}
                onClick={() => !row.original.disabled && row.original.onClick && row.original.onClick()}
              >
                {row.cells.map((cell, index) => (
                  <td {...cell.getCellProps()} key={index + "td"}>
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {loading && <Text style={{ cursor: "pointer", padding: "16px 0" }}>Loading...</Text>}
    </Root>
  );
};

const Root = styled.div<{ hovered?: boolean; fitContent?: boolean }>`
  width: ${({ fitContent }) => (fitContent ? "fit-content" : "100%")};
  background: ${({ theme }) => `${theme.colors.bgPrimary}`};

  table {
    width: 100%;
    border-spacing: 0;

    tr {
      color: ${({ theme }) => `${theme.colors.textPrimary}`};

      :hover {
        ${({ hovered }) => hovered && "cursor: pointer;"};
        ${({ hovered, theme }) => hovered && `background: ${theme.colors.textPrimary};`};
      }

      :last-child {
        td {
        }
      }
    }

    th {
      ${TEXT_TYPES_MAP[TEXT_TYPES.SUPPORTING]};
      padding: 11px 12px;
      text-align: left;
      color: ${({ theme }) => `${theme.colors.textSecondary}`};
      border-bottom: 1px solid ${({ theme }) => `${theme.colors.bgSecondary}`};
      cursor: default;
    }

    td {
      ${TEXT_TYPES_MAP[TEXT_TYPES.BODY]};
      color: ${({ theme }) => `${theme.colors.textPrimary}`};
      padding: 11px 12px;

      border-bottom: 1px solid ${({ theme }) => `${theme.colors.bgSecondary}`};

      :last-child {
        border-right: 0;
      }
    }
  }
`;

const HeaderWithTooltip = styled.div`
  text-decoration: underline dashed;
`;

export default Table;

export const TableText = styled(Text)`
  flex: 1;
  display: flex;
  align-items: center;
`;
