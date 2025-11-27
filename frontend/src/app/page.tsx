'use client';

import { useState } from 'react';
import { useSearchMovies, useAddToFavorites, useRemoveFromFavorites } from '@/hooks/useMovies';
import { Movie } from '@/types/movie';
import SearchBar from '@/components/searchBar';
import MovieCard from '@/components/MovieCard';
import Pagination from '@/components/pagination';


export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // BUG: Not using isLoading/error states properly
  const { data: searchResults, isLoading } = useSearchMovies(searchQuery, currentPage, searchEnabled);
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();

  // BUG: Complex calculation, should be memoized
  // BUG: OMDb returns 10 results per page, but this hardcodes it
  // BUG: If API changes page size, pagination breaks
  // BUG: Recalculates on every render even if searchResults hasn't changed
  const totalPages = searchResults?.data.totalResults 
    ? Math.ceil(parseInt(searchResults.data.totalResults) / 10)
    : 0;

  const handleSearch = (query: string) => {
    // BUG: No validation
    setSearchQuery(query);
    setSearchEnabled(true);
    setCurrentPage(1); 
  };

  const handleToggleFavorite = async (movie: Movie) => {
    // BUG: No error handling
    // BUG: No loading state
    // BUG: If mutation fails, UI state (isFavorite) is already updated optimistically
    // BUG: No way to rollback if mutation fails
    // BUG: Can be called multiple times rapidly, causing race conditions
    if (movie.isFavorite) {
      await removeFromFavorites.mutateAsync(movie.imdbID);
    } else {
      await addToFavorites.mutateAsync(movie);
    }
    // BUG: After mutation, searchResults still has old isFavorite value
    // Query invalidation happens but component doesn't re-render with new data immediately
  };

  const handlePageChange = (page: number) => {
    // BUG: No validation
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // BUG: Using window directly, should check if in browser
      window.scrollTo({ top: 0, behavior: "smooth" });
    } 
  };


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
          <p className="mt-4 text-muted-foreground">Searching for movies...</p>
        </div>
      )}

      {/* BUG: Complex conditional logic, hard to read */}
      {!isLoading && searchResults?.data.movies.length === 0 && !searchQuery && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Start Your Search</h2>
          <p className="text-muted-foreground">
            Search for your favorite movies and add them to your favorites
          </p>
        </div>
      )}

      {!isLoading && searchResults?.data.movies.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            No movies found for &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {/* BUG: Using && instead of proper conditional */}
      {!isLoading && searchResults?.data.movies.length && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {/* BUG: No error boundary */}
            {searchResults?.data.movies.map((movie) => (
              <MovieCard
                key={movie.imdbID}
                movie={movie}
                isFavorite={movie.isFavorite ?? false}
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

