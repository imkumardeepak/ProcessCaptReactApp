// src/hooks/useData.jsx
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

// Default options for query configuration
const defaultOptions = {
	cacheTime: 5 * 60 * 1000, // Cache data for 5 minutes
	staleTime: 1 * 60 * 1000, // Consider data fresh for 1 minute
	retry: 1, // Retry failed queries once
	refetchOnWindowFocus: false, // Disable refetch on window focus for heavy data
};

// Normalize query key to ensure it's an array
const normalizeQueryKey = (key) => (Array.isArray(key) ? key : [key]);

const useData = (queryKey, queryFn, options = {}) => {
	// Normalize query key
	const normalizedQueryKey = useMemo(() => normalizeQueryKey(queryKey), [queryKey]);

	// Wrap queryFn to ensure it returns a promise
	const wrappedQueryFn = useMemo(
		() => async () => {
			const result = await queryFn();
			if (result === undefined) {
				throw new Error('Query function returned undefined. Please ensure it returns a valid value.');
			}
			return result || []; // Fallback to empty array if result is null/undefined
		},
		[queryFn],
	);

	return useQuery({
		queryKey: normalizedQueryKey,
		queryFn: wrappedQueryFn,
		...defaultOptions, // Apply default options
		...options, // Override with user-provided options
	});
};

export default useData;
