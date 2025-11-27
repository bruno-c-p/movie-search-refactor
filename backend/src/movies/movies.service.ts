import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { MovieDto } from "./dto/movie.dto";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";

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

  async searchMovies(title: string, page: number = 1): Promise<any> {
    // BUG: No input validation, no error handling
    const response = await axios.get(
      `${this.baseUrl}&s=${title}&plot=full&page=${page}`, // BUG: Missing encodeURIComponent
    );

    // BUG: OMDb API returns Response: "False" (string) when no results, not a boolean
    // This check will fail silently - Response field is always a string
    if (response.data.Response === false || response.data.Error) {
      return { movies: [], totalResults: "0" };
    }

    return {
      movies: response.data.Search || [],
      totalResults: response.data.totalResults || "0",
    };
  }

  async getMovieByTitle(title: string, page: number = 1) {
    // BUG: No try-catch, will crash on API errors
    const response = await this.searchMovies(title, page);

    // BUG: Inefficient - checking favorites on every search
    // BUG: favorites array might be stale if file was modified externally
    const formattedResponse = response.movies.map((movie: any) => {
      // BUG: Case-sensitive comparison - some IDs might have different casing
      const isFavorite =
        this.favorites.find((fav) => fav.imdbID === movie.imdbID) !== undefined;
      return {
        title: movie.Title,
        imdbID: movie.imdbID,
        year: movie.Year, // BUG: Should parse to number, also handles "1999-2000" format incorrectly
        poster: movie.Poster,
        isFavorite,
      };
    });

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
