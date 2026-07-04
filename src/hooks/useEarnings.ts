import { useQuery } from '@tanstack/react-query';
import { fetchEarningsSummary, fetchPayouts } from '../api/earnings';

export function useEarningsSummary() {
	return useQuery({
		queryKey: ['earnings', 'summary'],
		queryFn: fetchEarningsSummary,
		staleTime: 1000 * 60 * 2,
	});
}

export function usePayouts(page = 1, limit = 20) {
	return useQuery({
		queryKey: ['earnings', 'payouts', page, limit],
		queryFn: () => fetchPayouts({ page, limit }),
	});
}
