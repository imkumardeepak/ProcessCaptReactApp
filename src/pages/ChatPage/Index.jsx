import React, { useEffect, useState, useRef } from 'react';
import PageHeader from '@/components/pageHeader';
import {
	Breadcrumbs,
	Card,
	Typography,
	List,
	ListItem,
	ListItemText,
	Box,
	TextField,
	Button,
	Grid,
	Avatar,
	Tooltip,
	ListItemButton,
	ListItemAvatar,
	CircularProgress,
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import audiobeep from '../../assets/sound/notifcationalert.mp3';
import userimage from '../../assets/images/avatars/man_2.png';
import { useApi } from '@/services/machineAPIService';
import useData from '@/utils/hooks/useData';
import { MailOutlineOutlined } from '@mui/icons-material';
import useGroupChatSocket from '@/utils/hooks/useGroupChatSocket'; // Import the new hook

function ChatPage() {
	return (
		<>
			<PageHeader title="Messages">
				<Breadcrumbs>
					<Typography color="text.tertiary">Home</Typography>
					<Typography color="text.tertiary">Messages</Typography>
				</Breadcrumbs>
			</PageHeader>
			<ChatBox />
		</>
	);
}

function ChatBox() {
	const { user } = useAuth();
	const [message, setMessage] = useState('');
	const chatBottomRef = useRef(null);
	const audioRef = useRef(null);
	const { fetchData } = useApi();
	const { data: usersData, isLoading, error } = useData('EmployeeMasters', () => fetchData('EmployeeMasters')); // Fetch employee data
	const [displayData, setDisplayData] = useState([]); // Initialize displayData with an empty array

	useEffect(() => {
		if (usersData && Array.isArray(usersData)) {
			setDisplayData(usersData); // Set displayData when usersData is available and is an array
		} else {
			setDisplayData([]); // Ensure displayData is an empty array if usersData is not an array or is undefined
		}
	}, [usersData]); // Update displayData whenever usersData changes

	const { messages, sendMessage } = useGroupChatSocket(user?.id); // Use the custom hook

	useEffect(() => {
		// Scroll to bottom when messages change
		chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const handleSendMessage = () => {
		if (!message.trim()) return;
		const chatMessage = {
			SenderId: user.id.toString(),
			SenderName: user.name,
			Message: message.trim(),
		};
		sendMessage(chatMessage); // Send message using the hook
		audioRef.current.play();
		setMessage('');
	};

	return (
		<Grid container spacing={2}>
			{/* Chat Interface (Left Side) */}
			<Grid item xs={12} md={8}>
				<Card sx={{ p: 2, height: '80vh', display: 'flex', flexDirection: 'column' }}>
					<Typography variant="h6" gutterBottom>
						All Employee Group Chat
					</Typography>
					<List
						sx={{
							flexGrow: 1,
							overflow: 'auto',
							maxHeight: 400,
							scrollBehavior: 'smooth',
							padding: 2,

							'&::-webkit-scrollbar': {
								width: '8px',
							},
							'&::-webkit-scrollbar-track': {
								backgroundColor: '#f5f5f5',
								borderRadius: '10px',
							},
							'&::-webkit-scrollbar-thumb': {
								backgroundColor: '#aaa',
								borderRadius: '10px',
							},
							'&::-webkit-scrollbar-thumb:hover': {
								background: '#777',
							},
						}}
					>
						{messages.map((chat, index) => (
							<ListItem
								key={index}
								alignItems="flex-start"
								sx={{
									display: 'flex',
									flexDirection: chat.SenderId === user.id.toString() ? 'column' : 'column',
									alignItems: chat.SenderId === user.id.toString() ? 'flex-end' : 'flex-start',
									mb: 1,
								}}
							>
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										flexDirection: chat.SenderId === user.id.toString() ? 'row-reverse' : 'row',
										mb: 0.5,
									}}
								>
									<Avatar
										alt={chat.SenderName}
										src={`${userimage}`}
										sx={{
											width: 30,
											height: 30,
											mr: chat.SenderId !== user.id.toString() ? 1 : 0,
											ml: chat.SenderId === user.id.toString() ? 1 : 0,
										}}
									/>
									<Typography
										variant="subtitle2"
										color={chat.SenderId === user.id.toString() ? 'primary' : 'inherit'}
										textAlign={chat.SenderId === user.id.toString() ? 'right' : 'left'}
									>
										<strong>{chat.SenderName}</strong>
									</Typography>
								</Box>
								<Typography
									variant="body2"
									color="textSecondary"
									sx={{
										backgroundColor: chat.SenderId === user.id.toString() ? '#e0f7fa' : '#f5f5f5',
										padding: '8px',
										borderRadius: '8px',
										display: 'inline-block',
										textAlign: chat.SenderId === user.id.toString() ? 'right' : 'left',
									}}
								>
									{chat.Message}
								</Typography>
							</ListItem>
						))}
						<div ref={chatBottomRef} />
					</List>
					<Box mt={2} display="flex" gap={2}>
						<TextField
							fullWidth
							label="Type a message..."
							autoFocus
							autoComplete="off"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
						/>
						<Button variant="contained" onClick={handleSendMessage}>
							Send
						</Button>
					</Box>
				</Card>
			</Grid>

			{/* Additional Information (Right Side) */}
			<Grid item xs={12} md={4}>
				<Card sx={{ p: 2, height: '80vh', overflowY: 'auto' }}>
					<Typography variant="h6" gutterBottom>
						Additional Information
					</Typography>
					{/* Add other information sections here */}
					{isLoading ? (
						<Box display="flex" justifyContent="center" alignItems="center" height="100%">
							<CircularProgress />
						</Box>
					) : error ? (
						<Typography color="error">Error: {error}</Typography>
					) : (
						<List
							sx={{
								'& > li:not(:last-child)': {
									borderBottom: 1,
									borderColor: (theme) => theme.palette.border,
								},
							}}
						>
							{displayData &&
								displayData.slice(0, 6).map((user) => <UserListItem key={user.id} user={user} />)}
						</List>
					)}
				</Card>
			</Grid>

			{/* Audio element for notification sound */}
			<audio ref={audioRef} src={audiobeep} preload="auto">
				<source src={audiobeep} type="audio/mp3" />
				<source src={audiobeep} type="audio/wav" />
				<track kind="captions" src="path/to/captions.vtt" srcLang="en" label="English" />
				Your browser does not support the audio element.
			</audio>
		</Grid>
	);
}

function UserListItem({ user }) {
	const { empName: name, designation: rol, empEmail } = user; // Use employee data fields

	// Function to generate a simple avatar based on the first letter of the name
	const generateAvatar = (name) => {
		const initials = name ? name.charAt(0).toUpperCase() : '';
		return <Avatar>{initials}</Avatar>;
	};

	return (
		<ListItem disablePadding alignItems="flex-start">
			<ListItemButton>
				<ListItemAvatar>
					{empEmail ? (
						<Avatar alt={name} src={userimage} />
					) : (
						generateAvatar(name) // Generate avatar if no image
					)}
				</ListItemAvatar>
				<span style={{ width: '100%' }}>
					<Typography variant="subtitle2" fontSize={13} color="primary.main">
						{name}
					</Typography>
					<Typography variant="caption">{rol}</Typography>
				</span>
				<Tooltip title="Mail">
					<a href={`mailto:${empEmail}`}>
						<MailOutlineOutlined fontSize="small" color="primary" />
					</a>
				</Tooltip>
			</ListItemButton>
		</ListItem>
	);
}

export default ChatPage;
