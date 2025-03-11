import React, { useEffect, useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, CircularProgress } from '@mui/material';
import { useApi } from '@/services/machineAPIService';
// Adjust to your API service

function DesignationSelect({ register, setValue, errors, designationDetails }) {
	const [designations, setDesignations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const { fetchData } = useApi();
	// Fetch the designations when the component mounts
	useEffect(() => {
		const fetchDesignations = async () => {
			try {
				const data = await fetchData('DesignationMasters'); // Adjust this API call as needed
				setDesignations(data);
			} catch (error) {
				setError('Failed to load designations');
			} finally {
				setIsLoading(false);
			}
		};
		fetchDesignations();
	}, []);

	// Set the initial value for the Select dropdown if the `designationDetails` is provided
	useEffect(() => {
		if (designationDetails?.designation) {
			setValue('designation', designationDetails.designation); // Set the initial value of the select field
		}
	}, [designationDetails, setValue]);

	// Handle error for Select input
	const helperText = errors.designation ? errors.designation.message : null;

	return (
		<FormControl fullWidth margin="normal" error={!!errors.designation}>
			<InputLabel>Designation</InputLabel>
			<Select
				label="Designation"
				{...register('designation', { required: 'Designation is required' })}
				defaultValue={designationDetails?.designation || ''} // Set the default value when in edit mode
				onChange={(e) => setValue('designation', e.target.value)} // Update form value on change
			>
				{/* Loading State */}
				{isLoading ? (
					<MenuItem disabled>
						<CircularProgress size={24} />
					</MenuItem>
				) : (
					designations?.map((designation) => (
						<MenuItem key={designation.designationName} value={designation.designationName}>
							{designation.designationName}
						</MenuItem>
					))
				)}
			</Select>
			<FormHelperText>{helperText}</FormHelperText>
		</FormControl>
	);
}

export default DesignationSelect;
