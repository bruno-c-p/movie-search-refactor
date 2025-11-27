import { Movie, SearchMoviesResponse, FavoritesResponse } from '@/types/movie';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/movies';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Request failed with status ${response.status}`,
    );
  }
  return response.json() as Promise<T>;
}

export const movieApi = {
  searchMovies: async (
    query: string,
    page: number = 1,
  ): Promise<SearchMoviesResponse> => {
    if (!query.trim()) {
      throw new Error('Search query is required');
    }

    const response = await fetch(
      `${API_BASE_URL}/search?q=${encodeURIComponent(query)}&page=${page}`,
    );

    return handleResponse<SearchMoviesResponse>(response);
  },

  getFavorites: async (page: number = 1): Promise<FavoritesResponse> => {
    const response = await fetch(`${API_BASE_URL}/favorites/list?page=${page}`);
    return handleResponse<FavoritesResponse>(response);
  },

  addToFavorites: async (movie: Movie): Promise<void> => {
    if (!movie.imdbID || !movie.title) {
      throw new Error('Movie must have imdbID and title');
    }

    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movie),
    });

    await handleResponse<{ data: { message: string } }>(response);
  },

  removeFromFavorites: async (imdbID: string): Promise<void> => {
    if (!imdbID.trim()) {
      throw new Error('imdbID is required');
    }

    const response = await fetch(`${API_BASE_URL}/favorites/${imdbID}`, {
      method: 'DELETE',
    });

    await handleResponse<{ data: { message: string } }>(response);
  },
};
