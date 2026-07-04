import { useQuery } from '@tanstack/react-query';
import { fetchMyDriverProfile } from '../api/drivers';

export function useDriverProfile() {
	return useQuery({
		queryKey: ['driver', 'profile'],
		queryFn: fetchMyDriverProfile,
		staleTime: 1000 * 60 * 2,
	});
}
