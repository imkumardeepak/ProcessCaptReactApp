import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import CardHeader from '@/components/cardHeader';

import { useApi } from '@/services/machineAPIService';
import useData from '@/utils/hooks/useData';
import { CardActions, Chip } from '@mui/material';

function ProductsSection() {
	return (
		<Card type="none">
			<Stack direction="column">
				<CardHeader
					title="Project Details"
					size="medium"
					sx={{
						mx: 2,
						my: 1,
						pt: 1,
					}}
				/>
				<ProductsTable />
				<CardActions sx={{ justifyContent: 'space-between', width: '100%', my: 1, mx: 1 }}>
					<Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
						<Typography variant="body2" color="text.secondary">
							Last Updated Date :{' '}
							{new Date().toLocaleDateString('en-GB', {
								day: '2-digit',
								month: '2-digit',
								year: 'numeric',
							})}
						</Typography>
					</Stack>
				</CardActions>
			</Stack>
		</Card>
	);
}

function ProductsTable() {
	const { fetchData } = useApi();
	const { data: usersData, isLoading, error } = useData('summaryreport', () => fetchData('Report/summaryreport'));

	if (isLoading) {
		return <Typography>Loading...</Typography>;
	}

	if (error) {
		return <Typography color="error">Error: {error.message}</Typography>;
	}

	const top10Data = usersData ? usersData.slice(0, 5) : [];
	console.log(top10Data);
	return (
		<TableContainer>
			<Table aria-label="production orders table" size="medium">
				<TableHead>
					<TableRow>
						<TableCell>#</TableCell>
						<TableCell align="center">Date</TableCell>
						<TableCell align="center">Project</TableCell>
						<TableCell align="center">Total Quantity</TableCell>
						<TableCell align="center">Total Weight</TableCell>
						<TableCell align="center">RFI</TableCell>
						<TableCell align="center">RFG</TableCell>
						<TableCell align="center">QCG</TableCell>
						<TableCell align="center">RFD</TableCell>
						<TableCell align="center">Pending</TableCell>
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
	const { date, plantcode, totalQnty, totalWeight, checkedRFI, checkedRFG, checkedQCG, checkedRFD, status } =
		purchase;
	const serialNumber = index + 1; // Calculate serial number

	return (
		<TableRow hover>
			<TableCell>
				<Typography variant="body2" color="text.secondary">
					{serialNumber}
				</Typography>
			</TableCell>
			<TableCell align="center">
				<Typography variant="subtitle2" color="text.primary">
					{new Date(date).toLocaleDateString('en-GB', {
						day: '2-digit',
						month: '2-digit',
						year: 'numeric',
					})}
				</Typography>
			</TableCell>
			<TableCell align="center">
				<Typography variant="body2" color="text.secondary">
					{plantcode}
				</Typography>
			</TableCell>
			<TableCell align="center">
				<Typography variant="body2" color="text.secondary">
					<Chip label={totalQnty} color="success" size="small" />
				</Typography>
			</TableCell>
			<TableCell align="center">
				<Typography variant="body2" color="text.secondary">
					{totalWeight}
				</Typography>
			</TableCell>
			<TableCell align="center">
				<Typography variant="body2" color="text.secondary">
					{checkedRFI}
				</Typography>
			</TableCell>
			<TableCell align="center">
				<Typography variant="body2" color="text.secondary">
					{checkedRFG}
				</Typography>
			</TableCell>
			<TableCell align="center">
				<Typography variant="body2" color="text.secondary">
					{checkedQCG}
				</Typography>
			</TableCell>
			<TableCell align="center">
				<Typography variant="body2" color="text.secondary">
					{checkedRFD}
				</Typography>
			</TableCell>
			<TableCell align="center">
				<Typography variant="body2" color="text.secondary">
					{status === 0 ? (
						<Chip label={status} color="success" size="small" />
					) : status === null ? (
						<Chip label={totalQnty} color="error" size="small" />
					) : (
						<Chip label={status} color="error" size="small" />
					)}
				</Typography>
			</TableCell>
		</TableRow>
	);
}

export default ProductsSection;
