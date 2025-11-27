import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { MovieDto } from "./dto/movie.dto";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";

interface OmdbMovie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

interface OmdbSearchResponse {
  Search?: OmdbMovie[];
  totalResults?: string;
  Response: "True" | "False";
  Error?: string;
}

interface SearchResult {
  movies: OmdbMovie[];
  totalResults: string;
}

@Injectable()
export class MoviesService {
  private favorites: MovieDto[] = [];

  private readonly favoritesFilePath = path.join(
    process.cwd(),
    "data",
    "favorites.json",
  );

  private readonly baseUrl: string;

  private getApiKey(): string {
    const apiKey = process.env.OMDB_API_KEY;
    if (!apiKey) {
      throw new Error("OMDB_API_KEY environment variable is not set");
    }
    return apiKey;
  }

  constructor() {
    this.baseUrl = `http://www.omdbapi.com/?apikey=${this.getApiKey()}`;
    this.loadFavorites();
  }

  private isValidMovie(movie: unknown): movie is MovieDto {
    return (
      typeof movie === "object" &&
      movie !== null &&
      "title" in movie &&
      "imdbID" in movie &&
      "year" in movie &&
      "poster" in movie
    );
  }

  private isValidFavoritesArray(parsed: unknown): parsed is MovieDto[] {
    return Array.isArray(parsed) && parsed.every((m) => this.isValidMovie(m));
  }

  private loadFavorites(): void {
    try {
      if (!fs.existsSync(this.favoritesFilePath)) {
        this.favorites = [];
        return;
      }

      const fileContent = fs.readFileSync(this.favoritesFilePath, "utf-8");

      const parsed: unknown = JSON.parse(fileContent);
      if (!this.isValidFavoritesArray(parsed)) {
        console.warn("Invalid favorites file format, starting fresh");
        this.favorites = [];
        return;
      }

      this.favorites = parsed;
    } catch (error) {
      console.error("Failed to load favorites:", error);
      this.favorites = [];
    }
  }

  private ensureDirectoryExists(): void {
    const dir = path.dirname(this.favoritesFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private saveFavorites(): void {
    try {
      this.ensureDirectoryExists();
      fs.writeFileSync(
        this.favoritesFilePath,
        JSON.stringify(this.favorites, null, 2),
      );
    } catch (error) {
      console.error("Failed to save favorites:", error);

      throw new HttpException(
        "Failed to save favorites",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async searchMovies(title: string, page: number = 1): Promise<SearchResult> {
    try {
      const response = await axios.get<OmdbSearchResponse>(
        `${this.baseUrl}&s=${encodeURIComponent(title)}&plot=full&page=${page}`,
      );

      if (response.data.Response === "False" || response.data.Error) {
        return { movies: [], totalResults: "0" };
      }

      return {
        movies: response.data.Search || [],
        totalResults: response.data.totalResults || "0",
      };
    } catch (error) {
      console.error("Failed to search movies:", error);

      throw new HttpException(
        "Failed to search movies",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private parseYear(yearStr: string): number {
    const match = yearStr.match(/^(\d{4})/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getMovieByTitle(title: string, page: number = 1) {
    const response = await this.searchMovies(title, page);

    this.loadFavorites();

    const favoriteIds = new Set(
      this.favorites.map((fav) => fav.imdbID.toLowerCase()),
    );

    const formattedResponse = response.movies.map((movie: OmdbMovie) => ({
      title: movie.Title,
      imdbID: movie.imdbID,
      year: this.parseYear(movie.Year),
      poster: movie.Poster,
      isFavorite: favoriteIds.has(movie.imdbID.toLowerCase()),
    }));

    return {
      data: {
        movies: formattedResponse,
        count: formattedResponse.length,
        totalResults: response.totalResults,
      },
    };
  }

  addToFavorites(movieToAdd: MovieDto) {
    // BUG: No validation that movieToAdd has required fields
    // BUG: Using find instead of some for performance
    // BUG: Not reloading favorites from file - if file was modified, this array is stale
    const foundMovie = this.favorites.find(
      (movie) => movie.imdbID === movieToAdd.imdbID,
    );
    if (foundMovie) {
      // BUG: Returning error instead of throwing
      return new HttpException(
        "Movie already in favorites",
        HttpStatus.BAD_REQUEST,
      );
    }

    // BUG: Not validating movie structure
    // BUG: Not checking if movieToAdd has all required fields (poster might be missing)
    this.favorites.push(movieToAdd);
    this.saveFavorites();

    // BUG: Not reloading favorites after save - if save fails silently, state is inconsistent
    return {
      data: {
        message: "Movie added to favorites",
      },
    };
  }

  removeFromFavorites(movieId: string) {
    // BUG: No validation that movieId is provided
    const foundMovie = this.favorites.find((movie) => movie.imdbID === movieId);
    if (!foundMovie) {
      // BUG: Returning error instead of throwing
      return new HttpException(
        "Movie not found in favorites",
        HttpStatus.NOT_FOUND,
      );
    }

    // BUG: Inefficient - using filter creates new array
    this.favorites = this.favorites.filter((movie) => movie.imdbID !== movieId);
    this.saveFavorites();

    return {
      data: {
        message: "Movie removed from favorites",
      },
    };
  }

  getFavorites(page: number = 1, pageSize: number = 10) {
    // BUG: Not reloading favorites from file - might be stale
    // BUG: Throwing error when empty instead of returning empty array
    if (this.favorites.length === 0) {
      throw new HttpException("No favorites found", HttpStatus.NOT_FOUND);
    }

    // BUG: No validation that page is positive
    // BUG: No validation that pageSize is positive
    // BUG: If page is 0 or negative, startIndex becomes negative and slice behaves unexpectedly
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedFavorites = this.favorites.slice(startIndex, endIndex);

    // BUG: Inconsistent response structure
    // BUG: totalResults is number but should be string to match search API response
    return {
      data: {
        favorites: paginatedFavorites,
        count: paginatedFavorites.length,
        totalResults: this.favorites.length, // BUG: Should be string to match API
        currentPage: page,
        totalPages: Math.ceil(this.favorites.length / pageSize),
      },
    };
  }
}
