import { useQuery } from '@tanstack/react-query';
import { fetchPayouts } from '../api/earnings';

export function usePayouts(page = 1, limit = 20) {
	return useQuery({
		queryKey: ['earnings', 'payouts', page, limit],
		queryFn: () => fetchPayouts({ page, limit }),
	});
}
