import React, { useState } from 'react';
import { Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';

function ConfirmButton({
	onConfirm,
	isLoading,
	buttonText = 'Submit',
	confirmText = 'Are you sure you want to submit?',
}) {
	const [open, setOpen] = useState(false);

	const handleConfirm = () => {
		setOpen(false);
		onConfirm(); // Call the actual submit function
	};

	return (
		<>
			{/* Trigger Button */}
			<Button color="success" variant="contained" disabled={isLoading} onClick={() => setOpen(true)} fullWidth>
				{isLoading ? <CircularProgress size={24} /> : buttonText}
			</Button>

			{/* Confirmation Dialog */}
			<Dialog open={open} onClose={() => setOpen(false)}>
				<DialogTitle>Confirm Action</DialogTitle>
				<DialogContent>
					<Typography>{confirmText}</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpen(false)} color="error">
						Cancel
					</Button>
					<Button onClick={handleConfirm} color="success" variant="contained">
						Yes, Submit
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

export default ConfirmButton;
