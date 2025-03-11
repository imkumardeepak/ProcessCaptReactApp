import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { v4 as uuid } from 'uuid';
import useWebSocket from '@/utils/hooks/useWebSocket';
import { Avatar } from '@mui/material';
import { NotificationAdd, Notifications } from '@mui/icons-material';
import { green } from '@mui/material/colors';

function NotificationsButton() {
	const navigate = useNavigate();
	const [anchorEl, setAnchorEl] = useState(null);
	const messages = useWebSocket(); // Fetch messages from WebSocket
	const open = Boolean(anchorEl);

	// Track unread messages count
	const [unreadCount, setUnreadCount] = useState(0);

	// Update unread count when a new message arrives
	useEffect(() => {
		setUnreadCount(messages.length);
	}, [messages]);

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
		// Reset unread count when user opens the menu
		setUnreadCount(0);
	};

	const handleClear = () => {
		messages.length = 0;
		// Clear all messages
		setUnreadCount(0);
		setAnchorEl(null);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const toNotifications = () => {
		handleClose();
		navigate('/pages/Chat');
	};

	return (
		<>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					'aria-labelledby': 'notificaciones menu',
				}}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
			>
				<Stack sx={{ maxWidth: 400, p: 2, pb: 0 }} direction="column" spacing={2}>
					<Stack direction="row" justifyContent="space-between" flexWrap="wrap">
						<Stack
							direction="row"
							alignItems="center"
							spacing={1}
							divider={<Divider orientation="vertical" flexItem />}
						>
							<Typography variant="subtitle1">Notifications</Typography>
							<Box
								component="span"
								bgcolor="secondary.main"
								borderRadius="20px"
								fontSize={12}
								px={1}
								py={0.5}
								color="secondary.contrastText"
							>
								{messages.length}
							</Box>
						</Stack>
						<Button variant="text" color="primary" size="small" sx={{ fontSize: 11 }} onClick={handleClear}>
							Clear all
						</Button>
						<IconButton
							aria-label="close notifications menu"
							onClick={handleClose}
							size="small"
							color="primary"
							sx={{ border: 1, display: { sm: 'none', xs: 'inline-flex' } }}
						>
							<CloseIcon fontSize="inherit" />
						</IconButton>
					</Stack>

					<Divider sx={{ my: 1 }} />

					<Stack direction="column" spacing={1} divider={<Divider flexItem />} onClick={toNotifications}>
						{messages.map((message) => (
							<Notification key={uuid()} notification={message} />
						))}
					</Stack>
				</Stack>
			</Menu>

			<Tooltip title="Notifications">
				<IconButton onClick={handleClick} size="small">
					<Badge color="error" overlap="circular" badgeContent={unreadCount} invisible={unreadCount === 0}>
						<Avatar sx={{ bgcolor: green[500] }}>
							<Notifications fontSize="medium" />
						</Avatar>
					</Badge>
				</IconButton>
			</Tooltip>
		</>
	);
}

function Notification({ notification }) {
	return (
		<ButtonBase
			sx={{
				py: 1,
				px: 2,
				'&:hover': {
					bgcolor: (theme) => alpha(theme.palette.primary.light, 0.1),
				},
				borderLeft: 3,
				borderLeftColor: notification?.checked ? '#d3d3d3' : 'primary.400',
			}}
		>
			<Stack width="100%" direction="row" spacing={2} alignItems="center" justifyContent="flex-start">
				<Stack direction="column" justifyContent="flex-start" alignItems="flex-start">
					<Typography align="left">
						<strong>{notification}</strong>
					</Typography>
				</Stack>
			</Stack>
		</ButtonBase>
	);
}

export default NotificationsButton;
