import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ButtonGroup from '@mui/material/ButtonGroup';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import CardHeader from '@/components/cardHeader';

import processimage from '@/assets/images/products/Manufacturingprocess.png';
import { useApi } from '@/services/machineAPIService';
import useData from '@/utils/hooks/useData';

function ProductsSection() {
	return (
		<Card type="none">
			<Stack direction="column">
				<CardHeader
					title="Production Orders"
					size="small"
					sx={{
						m: 2,
					}}
				>
					<ButtonGroup variant="outlined" size="small" aria-label="temporaly button group">
						{['Today'].map((tab, i) => (
							<Button
								key={i}
								variant={tab === 'Today' ? 'outlined' : 'outlined'}
								sx={{
									...(tab === 'Today' && {
										outline: (theme) => `0.5px solid ${theme.palette.primary.main}`,
									}),
								}}
							>
								{tab}
							</Button>
						))}
					</ButtonGroup>
				</CardHeader>
				<ProductsTable />
			</Stack>
		</Card>
	);
}

function ProductsTable() {
	const { fetchData } = useApi();
	const { data: usersData, isLoading, error } = useData('ProductionOrders', () => fetchData('ProductionOrders'));

	if (isLoading) {
		return <Typography>Loading...</Typography>;
	}

	if (error) {
		return <Typography color="error">Error: {error.message}</Typography>;
	}

	const top10Data = usersData ? usersData.slice(0, 5) : [];

	return (
		<TableContainer>
			<Table aria-label="production orders table" size="medium">
				<TableHead>
					<TableRow>
						<TableCell>#</TableCell>
						<TableCell align="left">Route Sheet No</TableCell>
						<TableCell align="left">Mark No</TableCell>
						<TableCell align="left">Section Code</TableCell>
						<TableCell align="right">Length</TableCell>
						<TableCell align="right">Width</TableCell>
						<TableCell align="right">Total Quantity</TableCell>
						<TableCell align="center">Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{top10Data.map((purchase, index) => (
						<ProductsTableRow key={purchase.id} purchase={purchase} index={index} />
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

function ProductsTableRow({ purchase, index }) {
	const { routeSheetNo, markNo, sectionCode, length, width, totalQunty } = purchase;
	const serialNumber = index + 1; // Calculate serial number

	return (
		<TableRow hover>
			<TableCell>
				<Typography variant="body2" color="text.secondary">
					{serialNumber}
				</Typography>
			</TableCell>
			<TableCell align="left">
				<Typography variant="subtitle2" color="text.primary">
					{routeSheetNo}
				</Typography>
			</TableCell>
			<TableCell align="left">
				<Typography variant="body2" color="text.secondary">
					{markNo}
				</Typography>
			</TableCell>
			<TableCell align="left">
				<Typography variant="body2" color="text.secondary">
					{sectionCode}
				</Typography>
			</TableCell>
			<TableCell align="right">
				<Typography variant="body2" color="text.secondary">
					{length}
				</Typography>
			</TableCell>
			<TableCell align="right">
				<Typography variant="body2" color="text.secondary">
					{width}
				</Typography>
			</TableCell>
			<TableCell align="right">
				<Typography variant="body2" color="text.secondary">
					{totalQunty}
				</Typography>
			</TableCell>
			<TableCell align="center">
				<IconButton size="small">
					<MoreHorizIcon fontSize="small" />
				</IconButton>
			</TableCell>
		</TableRow>
	);
}

export default ProductsSection;
