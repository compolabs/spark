import React from "react";
import styled from "@emotion/styled";
import { ColumnDef, flexRender, getCoreRowModel, Header, useReactTable } from "@tanstack/react-table";
import { observer } from "mobx-react";

import Text, { TEXT_TYPES, TEXT_TYPES_MAP } from "@components/Text";

import { SmartFlex } from "./SmartFlex";
import Tooltip from "./Tooltip";

interface IProps {
  columns: ColumnDef<any, any>[];
  data: any[];
  fitContent?: boolean;
  withHover?: boolean;
  onClick?: () => void;
  loading?: boolean;
}

const Table: React.FC<IProps> = observer(({ columns, data, onClick, fitContent, withHover, loading, ...rest }) => {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    autoResetAll: true,
  });

  const renderTooltip = (header: Header<any, any>) => {
    const tooltipContent = (header as any).tooltip;
    const content = header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext());

    if (!tooltipContent) {
      return content;
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
        <HeaderWithTooltip>{content}</HeaderWithTooltip>
      </Tooltip>
    );
  };

  return (
    <Root {...rest} fitContent={fitContent} hovered={withHover}>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>{renderTooltip(header)}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {loading && <Text style={{ cursor: "pointer", padding: "16px 0" }}>Loading...</Text>}
    </Root>
  );
});

export default Table;

const Root = styled.div<{ hovered?: boolean; fitContent?: boolean }>`
  width: 100vw;
  background: ${({ theme }) => `${theme.colors.bgPrimary}`};
  height: fit-content;

  table {
    width: 100%;
    border-spacing: 0;
    position: relative;

    thead {
      position: sticky;
      top: 0;
      background: ${({ theme }) => theme.colors.bgPrimary};
    }

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

export const TableText = styled(Text)`
  flex: 1;
  display: flex;
  align-items: center;
`;
