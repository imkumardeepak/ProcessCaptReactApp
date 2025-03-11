// src/hooks/useData.jsx
import { useQuery } from '@tanstack/react-query';

const useData = (queryKey, queryFn, options = {}) =>
	useQuery({
		queryKey: [queryKey], // Wrap the query key in an array for consistency
		queryFn, // Function to fetch the data
		...options, // Additional options for customization
	});

export default useData;
