import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { green, pink } from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuList from '@mui/material/MenuList';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
// assets
import avatar2 from '@/assets/images/avatars/man_2.png';

// Components
import NotificationsButton from './notificationButton';
import { useAuth } from '@/context/AuthContext';

function LoggedUser() {
	const [anchorEl, setAnchorEl] = useState(null);
	const { user } = useAuth();
	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};
	return (
		<>
			<Menu
				elevation={26}
				sx={{
					'& .MuiMenuItem-root': {
						mt: 0.5,
					},
				}}
				anchorEl={anchorEl}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				open={Boolean(anchorEl)}
				onClose={handleClose}
			>
				<UserMenu handleClose={handleClose} />
			</Menu>
			<Stack height="100%" direction="row" flex={1} justifyContent="flex-end" alignItems="center" spacing={0}>
				<NotificationsButton />
				<ButtonBase
					onClick={handleClick}
					variant="outlined"
					sx={{
						ml: 1,
						height: '100%',
						overflow: 'hidden',
						borderRadius: '25px',
						transition: '.2s',
						px: 1,
						transitionProperty: 'background,color',
						'&:hover': {
							bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
						},
						'&:hover .MuiSvgIcon-root': {
							opacity: '1',
						},
					}}
				>
					<Stack width="100%" direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
						<Avatar
							alt="User Img"
							src={avatar2}
							sx={{
								width: 35,
								height: 35,
								boxShadow: (theme) =>
									`0px 0px 0px 4px ${theme.palette.background.paper} ,0px 0px 0px 5px ${theme.palette.primary.main} `,
							}}
						/>
						<Typography
							variant="body2"
							display={{
								xs: 'none',
								sm: 'inline-block',
							}}
						>
							{/* Safely check if the user exists before rendering */}
							{user ? user.name : 'Guest'}
						</Typography>
						<ExpandMoreIcon
							fontSize="small"
							sx={{
								transition: '0.2s',
								opacity: '0',
							}}
						/>
					</Stack>
				</ButtonBase>
			</Stack>
		</>
	);
}

function UserMenu({ handleClose }) {
	const { user, logout } = useAuth();

	// Only render user menu if user is available
	if (!user) {
		return (
			<MenuList
				sx={{
					p: 1,
					'& .MuiMenuItem-root': {
						borderRadius: 2,
					},
				}}
			>
				<MenuItem onClick={logout} component={RouterLink} to="/">
					<ListItemIcon>
						<ExitToAppIcon fontSize="small" />
					</ListItemIcon>
					Login
				</MenuItem>
			</MenuList>
		);
	}

	return (
		<MenuList
			sx={{
				p: 1,
				'& .MuiMenuItem-root': {
					borderRadius: 2,
				},
			}}
		>
			<Stack px={3}>
				<Typography variant="subtitle1" textAlign="center">
					{user.name}
				</Typography>
				<Typography variant="subtitle2" textAlign="center">
					{user.role}
				</Typography>
			</Stack>
			<Divider
				sx={{
					borderColor: 'primary.light',
					my: 1,
				}}
			/>
			{/* <MenuItem onClick={handleClose} to="/pages/notifications" component={RouterLink}>
				<ListItemIcon>
					<NotificationsNoneOutlinedIcon fontSize="small" />
				</ListItemIcon>
				Notifications <ListBadge color="info.main" count={18} />
			</MenuItem>
			<MenuItem onClick={handleClose} to="/profile" component={RouterLink}>
				<ListItemIcon>
					<Person2OutlinedIcon fontSize="small" />
				</ListItemIcon>
				Profile
			</MenuItem> */}
			<MenuItem onClick={handleClose} to="/pages/settings" component={RouterLink}>
				<ListItemIcon>
					<SettingsOutlinedIcon fontSize="small" />
				</ListItemIcon>
				Account Settings
			</MenuItem>
			<MenuItem onClick={logout} component={RouterLink}>
				<ListItemIcon>
					<ExitToAppIcon fontSize="small" />
				</ListItemIcon>
				Logout
			</MenuItem>
		</MenuList>
	);
}

export default LoggedUser;
