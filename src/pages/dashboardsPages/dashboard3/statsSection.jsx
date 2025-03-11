import useAutoCounter from '@hooks/useAutoCounter';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import {
	AssignmentTurnedInOutlined,
	HourglassBottomOutlined,
	HourglassFullOutlined,
	ListAltOutlined,
} from '@mui/icons-material';

const STATS_DATA = [
	{
		id: 1,
		color: 'cuaternary.main',
		name: 'Total Routesheet',
		total: 50,
		Icon: ListAltOutlined,
	},
	{
		id: 2,
		color: 'tertiary.400',
		name: 'Partial Routesheet',
		total: 20,
		Icon: HourglassBottomOutlined,
	},
	{
		id: 3,
		color: 'secondary.main',
		name: 'Non-Partial Routesheet',
		total: 30,
		Icon: HourglassFullOutlined,
	},
	{
		id: 4,
		color: 'success.main',
		name: 'Completed Routesheet',
		total: 5,
		Icon: AssignmentTurnedInOutlined,
	},
];

function StatsSection() {
	return (
		<section>
			<Grid container spacing={2}>
				{STATS_DATA.map((stat) => (
					<Grid item xs={12} sm={6} md={3} key={stat.id}>
						<StatSection statData={stat} />
					</Grid>
				))}
			</Grid>
		</section>
	);
}

function StatSection({ statData }) {
	const { name, total, color, Icon } = statData;
	const counter = useAutoCounter({
		limiter: total,
		increment: 2,
		interval: 10,
	});

	return (
		<Card>
			<Stack direction="row" spacing={1} alignItems="center">
				<Icon
					sx={{
						fontSize: 50,
						color,
					}}
					color="disabled"
				/>
				<span>
					<Typography fontSize={25} variant="subtitle1">
						{counter.toLocaleString()}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{name}
					</Typography>
				</span>
			</Stack>
		</Card>
	);
}

export default StatsSection;
