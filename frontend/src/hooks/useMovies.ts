import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { movieApi } from '@/lib/api';
import { Movie, SearchMoviesResponse, FavoritesResponse } from '@/types/movie';

export const useSearchMovies = (
  query: string,
  page: number = 1,
  enabled: boolean = false,
): UseQueryResult<SearchMoviesResponse, Error> => {
  return useQuery({
    queryKey: ['movies', 'search', query, page],
    queryFn: () => movieApi.searchMovies(query, page),
    enabled: enabled && query.trim().length > 0,
    retry: 1,
  });
};

export const useFavorites = (
  page: number = 1,
): UseQueryResult<FavoritesResponse, Error> => {
  return useQuery({
    queryKey: ['movies', 'favorites', page],
    queryFn: () => movieApi.getFavorites(page),
    retry: false,
  });
};

export const useAddToFavorites = (): UseMutationResult<void, Error, Movie> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: movieApi.addToFavorites,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['movies', 'favorites'] });
      void queryClient.invalidateQueries({ queryKey: ['movies', 'search'] });
    },
    onError: (error) => {
      console.error('Failed to add to favorites:', error.message);
    },
  });
};

export const useRemoveFromFavorites = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: movieApi.removeFromFavorites,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['movies', 'favorites'] });
      void queryClient.invalidateQueries({ queryKey: ['movies', 'search'] });
    },
    onError: (error) => {
      console.error('Failed to remove from favorites:', error.message);
    },
  });
};
