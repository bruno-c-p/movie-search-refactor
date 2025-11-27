'use client';

import { useMemo, useState } from 'react';
import {
  useSearchMovies,
  useAddToFavorites,
  useRemoveFromFavorites,
} from '@/hooks/useMovies';
import { Movie } from '@/types/movie';
import SearchBar from '@/components/searchBar';
import MovieCard from '@/components/MovieCard';
import Pagination from '@/components/pagination';

const RESULTS_PER_PAGE = 10;

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: searchResults,
    isLoading,
    error,
  } = useSearchMovies(searchQuery, currentPage, searchEnabled);
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();

  const totalPages = useMemo(() => {
    if (!searchResults?.data.totalResults) return 0;
    return Math.ceil(
      parseInt(searchResults.data.totalResults) / RESULTS_PER_PAGE,
    );
  }, [searchResults?.data.totalResults]);

  const isMutating = addToFavorites.isPending || removeFromFavorites.isPending;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSearchEnabled(true);
    setCurrentPage(1);
  };

  const handleToggleFavorite = (movie: Movie) => {
    if (isMutating) return;

    if (movie.isFavorite) {
      removeFromFavorites.mutate(movie.imdbID);
    } else {
      addToFavorites.mutate(movie);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const movies = searchResults?.data.movies ?? [];
  const hasMovies = movies.length > 0;
  const showEmptyState = !isLoading && !error && !hasMovies && !searchQuery;
  const showNoResults = !isLoading && !error && !hasMovies && searchQuery;
  const showResults = !isLoading && !error && hasMovies;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text">
              Movie Finder
            </h1>
          </div>
          <SearchBar onSearch={handleSearch} />
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-r-transparent" />
            <p className="mt-4 text-muted-foreground">
              Searching for movies...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-xl text-red-500">
              Error: {error.message || 'Failed to search movies'}
            </p>
          </div>
        )}

        {showEmptyState && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">Start Your Search</h2>
            <p className="text-muted-foreground">
              Search for your favorite movies and add them to your favorites
            </p>
          </div>
        )}

        {showNoResults && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No movies found for &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {showResults && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie, index) => (
                <MovieCard
                  key={`${movie.imdbID}-${index}`}
                  movie={movie}
                  isFavorite={movie.isFavorite ?? false}
                  isLoading={isMutating}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

