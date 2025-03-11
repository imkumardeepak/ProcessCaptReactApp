import { useSearchParams } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import calcHeaderHeight from '@helpers/layoutHeight';

// MUI
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';

import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';

import PageHeader from '@/components/pageHeader';

import Profile from './profile';
import Security from './security';
import { useAuth } from '@/context/AuthContext';

const menuOptions = [
	{
		id: uuid(),
		name: 'profile',
		Icon: AccountBoxOutlinedIcon,
		text: 'Profile',
		renderSection: <Profile />,
	},

	{
		id: uuid(),
		name: 'security',
		Icon: VpnKeyOutlinedIcon,
		text: 'Security',
		renderSection: <Security />,
	},
];

function EditProfile() {
	const [searchParams, setSearchParams] = useSearchParams();
	const activeSection = searchParams.get('section') || menuOptions[0].name;
	const { user } = useAuth();
	const changeSectionHandler = (sectionName) => {
		window.scrollTo({
			top: 0,
			left: 0,
			behavior: 'smooth',
		});
		setSearchParams({ section: sectionName });
	};

	return (
		<>
			<PageHeader title="Account Settings Page">
				<Breadcrumbs
					aria-label="breadcrumb"
					sx={{
						textTransform: 'uppercase',
					}}
				>
					<Typography underline="hover">Profile</Typography>
					<Typography color="text.tertiary">Settings</Typography>
				</Breadcrumbs>
			</PageHeader>
			<Grid container rowSpacing={2} columnSpacing={4}>
				<Grid item xs={12} sm={4} md={3}>
					<Card
						sx={{
							position: 'sticky',
							top: `${calcHeaderHeight('nav', false) + 30}px`,
						}}
						component="aside"
					>
						<Typography variant="subtitle1">{user ? user.name : 'Guest'}</Typography>
						<Divider sx={{ borderColor: 'primary.light', my: 1 }} />
						<MenuList
							sx={{
								'& .MuiMenuItem-root': {
									borderRadius: 2,
								},
							}}
						>
							{menuOptions.map(({ id, name, Icon, text }) => (
								<MenuListItem
									key={id}
									text={text}
									Icon={Icon}
									onClick={() => changeSectionHandler(name)}
									selected={activeSection === name}
								/>
							))}
						</MenuList>
					</Card>
				</Grid>
				<Grid item xs={12} sm={8} md={9}>
					{menuOptions.find((option) => option.name === activeSection)?.renderSection}
				</Grid>
			</Grid>
		</>
	);
}

function MenuListItem({ Icon, text, ...props }) {
	return (
		<MenuItem {...props}>
			<ListItemIcon>
				<Icon fontSize="medium" />
			</ListItemIcon>
			{text}
		</MenuItem>
	);
}

export default EditProfile;
