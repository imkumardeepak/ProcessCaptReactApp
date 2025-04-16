import Card from '@mui/material/Card';

import CardHeader from '@/components/cardHeader';
import { Chip, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

function CustomersOverviewCard({ cuttingData }) {
	return (
		<Card sx={{ p: 0 }} type="none">
			<CardHeader title="Pending Routesheet Status" size="small" sx={{ p: 1 }} />
			<Table>
				<TableHead>
					<TableRow>
						<TableCell sx={{ fontWeight: 'bold', p: 0.8 }}>#</TableCell>
						<TableCell sx={{ fontWeight: 'bold', p: 0.8 }}>Routesheet</TableCell>
						<TableCell sx={{ fontWeight: 'bold', p: 0.8 }}>Pending Operation</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{cuttingData.routeSheetresult.length > 0 ? (
						cuttingData.routeSheetresult.map((item, index) => (
							<TableRow key={item.id}>
								<TableCell sx={{ p: 0.8 }}>{index + 1}</TableCell>
								<TableCell sx={{ p: 0.8 }}>{item.routeSheet}</TableCell>
								<TableCell sx={{ p: 0.8 }}>
									{item.pendingOperation === '' ? (
										<Chip label="Completed" color="success" />
									) : (
										<Chip label={item.pendingOperation} color="error" />
									)}
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={2} sx={{ p: 0.8 }}>
								No pending routesheets
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</Card>
	);
}

export default CustomersOverviewCard;
