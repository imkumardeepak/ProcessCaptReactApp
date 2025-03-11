// MUI
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

import PageHeader from '@/components/pageHeader';

function WelcomeSection() {
	return (
		<PageHeader title="Dashboard">
			<Breadcrumbs
				aria-label="breadcrumb"
				sx={{
					textTransform: 'uppercase',
				}}
			>
				{/* <Link underline="hover" href="#!">
					Inicio
				</Link> */}
				{/* <Typography color="text.primary">Dashboard</Typography> */}
			</Breadcrumbs>
		</PageHeader>
	);
}

export default WelcomeSection;
