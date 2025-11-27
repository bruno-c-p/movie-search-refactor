"use client";

import { useEffect, useMemo, useState } from "react";
import MovieCard from "@/components/MovieCard";
import Pagination from "@/components/pagination";

import { Button } from "@/components/ui/button";
import { useFavorites, useRemoveFromFavorites } from "@/hooks/useMovies";
import { Movie } from "@/types/movie";
import Link from "next/link";

const Favorites = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: favorites,
    isLoading,
    error,
  } = useFavorites(currentPage);

  const removeFromFavorites = useRemoveFromFavorites();

  const totalResults = useMemo(() => {
    if (!favorites?.data.totalResults) return 0;
    return parseInt(String(favorites.data.totalResults), 10) || 0;
  }, [favorites?.data.totalResults]);

  const totalPages = favorites?.data.totalPages ?? 1;
  const favoritesList = favorites?.data.favorites ?? [];

  useEffect(() => {
    if (favoritesList.length === 0 && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [favoritesList.length, currentPage]);

  const handleRemoveFavorite = (movie: Movie) => {
    if (removeFromFavorites.isPending) return;
    removeFromFavorites.mutate(movie.imdbID);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <h1 className="text-4xl md:text-5xl text-white font-bold bg-clip-text">
              My Favorites
            </h1>
          </div>
          <p className="text-center text-muted-foreground">
            {totalResults} {totalResults === 1 ? "movie" : "movies"} saved
          </p>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Loading favorites...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-xl text-red-500">
              Error: {error.message || "Failed to load favorites"}
            </p>
          </div>
        )}

        {!isLoading && !error && totalResults === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">No Favorites Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start adding movies to your favorites from the search page
            </p>
            <Link href="/">
              <Button className="bg-gradient-primary">Search Movies</Button>
            </Link>
          </div>
        )}

        {!isLoading && !error && totalResults > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {favoritesList.map((movie, index) => (
                <MovieCard
                  key={`${movie.imdbID}-${index}`}
                  movie={movie}
                  isFavorite={true}
                  isLoading={removeFromFavorites.isPending}
                  onToggleFavorite={handleRemoveFavorite}
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
};

export default Favorites;
