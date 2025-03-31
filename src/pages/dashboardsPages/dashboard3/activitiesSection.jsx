import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import CardHeader from '@/components/cardHeader';
import Button from '@mui/material/Button';
import { Dialog, DialogActions, DialogContent, DialogTitle, Chip } from '@mui/material';
import Stack from '@mui/material/Stack';
import dayjs from 'dayjs';
import axios from 'axios';

// Google Calendar-like predefined colors
const googleCalendarColors = [
	'#4285F4', // Blue
	'#34A853', // Green
	'#FBBC05', // Yellow
	'#EA4335', // Red
	'#9C27B0', // Purple
	'#FF9800', // Orange
	'#00BCD4', // Cyan
	'#673AB7', // Deep Purple
	'#3F51B5', // Indigo
	'#607D8B', // Blue Grey
];

// Function to get a random color from the predefined Google Calendar-like colors
const getGoogleCalendarColor = () => {
	const randomIndex = Math.floor(Math.random() * googleCalendarColors.length);
	return googleCalendarColors[randomIndex];
};

function ActivitiesCard() {
	const [currentTime, setCurrentTime] = useState(dayjs().format('hh:mm A'));
	const [selectedDate, setSelectedDate] = useState(dayjs()); // Controlled state for the selected date
	const [eventsForSelectedDate, setEventsForSelectedDate] = useState([]);
	const [open, setOpen] = useState(false); // For managing the "See All Event" dialog
	const currentYear = new Date().getFullYear(); // Get current year dynamically
	const [holidays, setHolidays] = useState(() => {
		// Get holidays for the current year from localStorage
		const savedHolidays = localStorage.getItem(`holidays_${currentYear}`);
		return savedHolidays ? JSON.parse(savedHolidays) : [];
	});

	// Fetch holidays if not already saved in localStorage
	useEffect(() => {
		if (holidays.length === 0) {
			const fetchHolidays = async () => {
				try {
					const response = await axios.get('https://calendarific.com/api/v2/holidays', {
						params: {
							api_key: 'F65ay2RYXbOnpLkEGchhgct7SWIXijtb', // API Key
							country: 'in', // Country code
							year: currentYear, // Use the current year
						},
					});

					const fetchedHolidays = response.data.response.holidays;
					// Save fetched holidays to localStorage for the current year
					localStorage.setItem(`holidays_${currentYear}`, JSON.stringify(fetchedHolidays));
					setHolidays(fetchedHolidays);
					console.log('Fetched holidays for', currentYear);
				} catch (error) {
					console.error('Error fetching holidays:', error);
				}
			};
			fetchHolidays();
		} else {
			console.log('Using saved holidays from localStorage');
		}
	}, [currentYear, holidays]); // Depend on currentYear and holidays

	// Update current time every second
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(dayjs().format('hh:mm A'));
		}, 1000); // Updates every second
		return () => clearInterval(timer); // Cleanup on unmount
	}, []);

	// Handle Date Change
	const handleDateChange = (newDate) => {
		setSelectedDate(newDate); // Update state when the date changes
		const formattedDate = newDate.format('YYYY-MM-DD');

		// Filter holidays for the selected date and assign a random Google Calendar-like color
		const filteredHolidays = holidays
			.filter((holiday) => holiday.date.iso === formattedDate) // Filter holidays based on the selected date
			.map((holiday) => ({
				...holiday,
				color: getGoogleCalendarColor(), // Assign a Google Calendar-like color
			}));

		setEventsForSelectedDate(filteredHolidays); // Set the filtered events
		setOpen(true); // Open the dialog to show filtered events
	};

	// Open dialog to show all events
	const handleOpen = () => {
		setOpen(true);
	};

	// Close the dialog
	const handleClose = () => {
		setOpen(false);
	};

	// Handle Show All Events
	const handleShowAllEvent = () => {
		// Map through the holidays and add Google Calendar-like colors
		const filteredEvents = holidays.map((holiday) => ({
			...holiday,
			color: getGoogleCalendarColor(), // Assign a Google Calendar-like color
		}));

		setEventsForSelectedDate(filteredEvents); // Set the filtered events
		setOpen(true); // Open the event view (or your modal/display)
	};

	return (
		<Card sx={{ height: '100%' }}>
			<CardHeader title="Calendar" size="small" subtitle={`Current time: ${currentTime}`}>
				<Button size="small" onClick={handleShowAllEvent}>
					See All Events
				</Button>
			</CardHeader>

			<Stack direction="column" height="100%" py={0}>
				<LocalizationProvider dateAdapter={AdapterDayjs}>
					<DateCalendar value={selectedDate} onChange={handleDateChange} />
				</LocalizationProvider>
			</Stack>

			{/* Dialog for viewing all events */}
			<Dialog open={open} onClose={handleClose} fullWidth>
				<DialogTitle>All Events</DialogTitle>
				<DialogContent>
					{eventsForSelectedDate.length > 0 ? (
						eventsForSelectedDate.map((event) => (
							<div
								key={event.id}
								style={{
									marginBottom: '16px',
									padding: '10px',
									borderRadius: '4px',
									display: 'flex',
									alignItems: 'center', // Align the point and text horizontally
								}}
							>
								{/* Event color point */}
								<div
									style={{
										width: '10px',
										height: '10px',
										borderRadius: '50%',
										backgroundColor: event.color, // Circle with event color
										marginRight: '10px', // Space between the point and the text
									}}
								></div>

								<div>
									<Typography variant="h5">{event.name}</Typography>
									<Typography variant="body2">{event.description}</Typography>
									<Chip
										label={'Date: ' + event.date.iso}
										sx={{ borderColor: event.color }}
										variant="outlined"
									/>
								</div>
							</div>
						))
					) : (
						<Typography>No events for this day.</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="primary">
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</Card>
	);
}

export default ActivitiesCard;
