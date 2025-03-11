import { useState, useEffect } from 'react';

// Define shifts
const shifts = [
	{ id: 1, compcode: '2500', plantcode: '4511', shift_name: 'A', start_time: '07:00:00', end_time: '15:00:00' },
	{ id: 2, compcode: '2500', plantcode: '4511', shift_name: 'B', start_time: '15:00:00', end_time: '23:00:00' },
	{ id: 3, compcode: '2500', plantcode: '4511', shift_name: 'C', start_time: '23:00:00', end_time: '07:00:00' },
];

function useCurrentShift() {
	const [currentShift, setCurrentShift] = useState(null);

	useEffect(() => {
		function getCurrentShift() {
			const now = new Date();
			const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

			for (const shift of shifts) {
				const [startHour, startMinute, startSecond] = shift.start_time.split(':').map(Number);
				const [endHour, endMinute, endSecond] = shift.end_time.split(':').map(Number);

				const startTimeInSeconds = startHour * 3600 + startMinute * 60 + startSecond;
				const endTimeInSeconds = endHour * 3600 + endMinute * 60 + endSecond;

				if (endTimeInSeconds < startTimeInSeconds) {
					if (currentTime >= startTimeInSeconds || currentTime < endTimeInSeconds) {
						setCurrentShift(shift.shift_name);
						return;
					}
				} else if (currentTime >= startTimeInSeconds && currentTime < endTimeInSeconds) {
					setCurrentShift(shift.shift_name);
					return;
				}
			}
			setCurrentShift(null);
		}

		getCurrentShift(); // Call it immediately to set the initial value
		const intervalId = setInterval(getCurrentShift, 60000); // Update every minute

		return () => clearInterval(intervalId); // Cleanup interval on unmount
	}, []);

	return currentShift;
}

export default useCurrentShift;
