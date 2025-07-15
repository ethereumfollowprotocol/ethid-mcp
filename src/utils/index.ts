import { LeaderboardFilter } from '../types/api';

export function arrayToChunks<T>(array: T[], chunkSize: number): T[][] {
	const chunks = [];
	for (let index = 0; index < array.length; index += chunkSize) {
		chunks.push(array.slice(index, index + chunkSize));
	}
	return chunks;
}

export const formatQueryParams = (inputs: Record<string, string | number | string[] | LeaderboardFilter | null | undefined>) =>
	Object.entries(inputs)
		.filter(([, value]) => !!value)
		.map(([param, value]) => {
			if (Array.isArray(value)) {
				return `${param}=${value.join(',')}`;
			}

			return `${param}=${value}`;
		})
		.join('&');
