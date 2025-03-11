import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { createTheme, ThemeProvider, useTheme, Box, Button } from '@mui/material';
import { ImFileExcel, ImFilePdf } from 'react-icons/im';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

function PlanningTable({ columns, data, onSelectionChange }) {
	const globalTheme = useTheme();

	// Create a custom table theme, inheriting global theme properties
	const tableTheme = useMemo(
		() =>
			createTheme({
				palette: {
					mode: globalTheme.palette.mode, // Use the global theme mode (light/dark)
					primary: globalTheme.palette.primary, // Use primary color from global theme
					info: {
						main: '#006BFF', // Custom color for alerts, if applicable
					},
					background: {
						default: '#FFFFFF', // White background for both light and dark modes
						paper: '#FFFFFF', // White background for paper components
					},
				},
				typography: {
					button: {
						textTransform: 'none', // Keep button text as it is
						fontSize: '1rem', // Slightly larger font size for table buttons
					},
				},

				muiPaginationProps: {
					color: 'secondary',
					rowsPerPageOptions: [10, 20, 30],
					shape: 'rounded',
					variant: 'outlined',
				},
				components: {
					MuiTooltip: {
						styleOverrides: {
							tooltip: {
								fontSize: '0.875rem', // Adjust tooltip font size
							},
						},
					},
					MuiSwitch: {
						styleOverrides: {
							thumb: {
								color: '#ff4081', // Example: change switch thumb color
							},
						},
					},
				},
			}),
		[globalTheme],
	);

	const [rowSelection, setRowSelection] = useState({});
	const memoizedColumns = useMemo(() => columns, [columns]);
	const table = useMaterialReactTable({
		columns: memoizedColumns,
		data: data || [],
		enableRowSelection: true,
		enableGrouping: false,
		enableStickyHeader: true,
		getRowId: (row) => row.id,
		muiTableBodyProps: {
			sx: {
				'& tr:nth-of-type(odd) > td': {
					backgroundColor: '#f5f5f5',
				},
			},
		},
		initialState: {
			pagination: { pageSize: 50, pageIndex: 0 }, // Set initial pagination
			density: 'compact', // Set initial density to "low"
		},
		muiTableBodyRowProps: ({ row }) => ({
			onClick: row.getToggleSelectedHandler(),
			sx: { cursor: 'pointer' },
		}),
		onRowSelectionChange: (updaterOrValue) => {
			const value =
				typeof updaterOrValue === 'function' ? updaterOrValue(table.getState().rowSelection) : updaterOrValue;
			setRowSelection(value);
			const selectedRowData = table
				.getRowModel()
				.rows.filter((row) => value[row.id])
				.map((row) => row.original);
			onSelectionChange(selectedRowData);
		},
		state: { rowSelection },
		renderTopToolbarCustomActions: ({ table }) => (
			<Box sx={{ display: 'flex', gap: '1rem', p: '8px', alignItems: 'center' }}>
				<Button
					color="success"
					onClick={() => handleExportExcelWithTheme(table.getPrePaginationRowModel().rows)}
					startIcon={<ImFileExcel />}
					variant="text"
				>
					Export to Excel
				</Button>
				<Button
					color="error"
					onClick={() => handleExportPdf(table.getPrePaginationRowModel().rows)}
					startIcon={<ImFilePdf />}
					variant="text"
				>
					Export to PDF
				</Button>
			</Box>
		),
	});

	const handleExportExcelWithTheme = (rows) => {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('Sheet 1');

		const headers = Object.keys(rows[0].original).map((header) => header.toUpperCase());
		const headerRow = worksheet.addRow(headers);

		headerRow.eachCell((cell) => {
			cell.font = {
				name: 'Calibri',
				bold: true,
				size: 12,
			};
			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'AAB99A' },
			};
			cell.alignment = {
				vertical: 'middle',
				horizontal: 'center',
			};
			cell.border = {
				top: { style: 'thin' },
				left: { style: 'thin' },
				bottom: { style: 'thin' },
				right: { style: 'thin' },
			};
		});

		rows.forEach((row) => {
			const dataRow = worksheet.addRow(Object.values(row.original));
			dataRow.eachCell((cell) => {
				cell.font = {
					name: 'Calibri',
					size: 11,
				};
				cell.alignment = {
					vertical: 'middle',
					horizontal: 'left',
				};
				cell.border = {
					top: { style: 'thin' },
					left: { style: 'thin' },
					bottom: { style: 'thin' },
					right: { style: 'thin' },
				};
			});
		});

		worksheet.columns.forEach((column) => {
			let maxLength = 0;
			column.eachCell({ includeEmpty: true }, (cell) => {
				const cellValue = cell.value || '';
				maxLength = Math.max(maxLength, cellValue.toString().length);
			});
			column.width = maxLength + 2;
		});

		workbook.xlsx.writeBuffer().then((buffer) => {
			const blob = new Blob([buffer], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			});
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = 'export.xlsx';
			link.click();
		});
	};

	const handleExportPdf = (rows) => {
		const doc = new jsPDF({
			orientation: 'landscape',
			format: 'a3',
		});

		const title = 'Production Release Data Export';
		doc.setFont('Helvetica', 'bold');
		doc.setFontSize(18);
		doc.text(title, 14, 20);

		const headers = Object.keys(rows[0].original).map((header) => header.toUpperCase());
		const tableData = rows.map((row) => Object.values(row.original));

		autoTable(doc, {
			head: [headers],
			body: tableData,
			startY: 30,
			styles: {
				font: 'Helvetica',
				fontSize: 10,
				halign: 'center',
				valign: 'middle',
			},
			headStyles: {
				fillColor: [63, 81, 181],
				textColor: [255, 255, 255],
				fontSize: 12,
				halign: 'center',
				bold: true,
			},
			alternateRowStyles: {
				fillColor: [245, 245, 245],
			},
			bodyStyles: {
				textColor: [0, 0, 0],
			},
			columnStyles: {
				0: { halign: 'left' },
			},
			margin: { top: 30, bottom: 20, left: 14, right: 14 },
		});

		const pageCount = doc.getNumberOfPages();
		for (let i = 1; i <= pageCount; i++) {
			doc.setPage(i);
			doc.setFont('Helvetica', 'normal');
			doc.setFontSize(10);
			const footerText = `Page ${i} of ${pageCount}`;
			doc.text(footerText, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10, {
				align: 'right',
			});
		}

		doc.save('export.pdf');
	};

	return (
		<ThemeProvider theme={tableTheme}>
			<MaterialReactTable table={table} />
		</ThemeProvider>
	);
}

PlanningTable.propTypes = {
	columns: PropTypes.arrayOf(
		PropTypes.shape({
			accessorKey: PropTypes.string.isRequired,
			header: PropTypes.string.isRequired,
			size: PropTypes.number,
			renderCell: PropTypes.func,
		}),
	).isRequired,
	data: PropTypes.arrayOf(PropTypes.object).isRequired,
	onSelectionChange: PropTypes.func.isRequired,
};

export default PlanningTable;
