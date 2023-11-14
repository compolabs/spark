import React from "react";
import { TableProps, useTable } from "react-table";
import styled from "@emotion/styled";

// import Loading from "@components/Loading";

interface IProps extends TableProps {
	columns: any[];
	data: any[];
	fitContent?: boolean;
	withHover?: boolean;
	onClick?: () => void;
	loading?: boolean;
}

const Root = styled.div<{
	hovered?: boolean;
	fitContent?: boolean;
}>`
	width: ${({ fitContent }) => (fitContent ? "fit-content" : "100%")};
	border-radius: 4px !important;
	background: ${({ theme }) => `${theme.colors.bgSecondary}`};

	table {
		width: 100%;
		border-spacing: 0;

		tr {
			font-size: 14px;
			line-height: 20px;
			color: ${({ theme }) => `${theme.colors.bgSecondary}`};
			width: 100%;
			transition: 0.4s;

			:hover {
				${({ hovered }) => hovered && "cursor: pointer;"};
				${({ hovered, theme }) => hovered && `background: ${theme.colors.bgSecondary};`};
			}

			:last-child {
				td {
				}
			}
		}

		th {
			color: ${({ theme }) => `${theme.colors.bgSecondary}`};
			font-family: Space Grotesk;
			font-size: 10px;
			font-style: normal;
			font-weight: 400;
			line-height: normal;
			letter-spacing: 1.12px;
			text-align: left;
			padding: 14px;
			color: ${({ theme }) => `${theme.colors.bgSecondary}`};
			border-bottom: 2px solid ${({ theme }) => `${theme.colors.bgSecondary}`};
			cursor: default;
		}

		td {
			font-size: 16px;
			line-height: 20px;
			color: ${({ theme }) => `${theme.colors.bgSecondary}`};
			padding: 16px;
			border-bottom: 2px solid ${({ theme }) => `${theme.colors.bgSecondary}`};

			:last-child {
				border-right: 0;
			}
		}
	}
`;

const Table: React.FC<IProps> = ({ columns, data, onClick, fitContent, withHover, loading, ...rest }) => {
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });
	return (
		<Root {...rest} hovered={withHover} fitContent={fitContent}>
			<table {...getTableProps()}>
				<thead>
					{headerGroups.map((headerGroup, index) => (
						<tr {...headerGroup.getHeaderGroupProps()} key={index + "tr-header"}>
							{headerGroup.headers.map((column, index) => (
								<th {...column.getHeaderProps()} key={index + "th"}>
									{column.render("Header")}
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
		</Root>
	);
};

export default Table;
