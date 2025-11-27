import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  BadRequestException,
} from "@nestjs/common";
import { MoviesService } from "./movies.service";
import { MovieDto } from "./dto/movie.dto";

@Controller("movies")
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get("search")
  async searchMovies(@Query("q") query: string, @Query("page") page?: string) {
    const trimmedQuery = query ? query.trim() : "";
    if (!trimmedQuery) {
      throw new BadRequestException("Search query is required");
    }

    const pageNumber = page ? parseInt(page, 10) : 1;
    if (isNaN(pageNumber) || pageNumber < 1) {
      throw new BadRequestException("Page must be a positive number");
    }

    return await this.moviesService.getMovieByTitle(trimmedQuery, pageNumber);
  }

  @Post("favorites")
  addToFavorites(@Body() movieToAdd: MovieDto) {
    // BUG: No validation decorators
    // BUG: Not checking if movieToAdd is null/undefined
    return this.moviesService.addToFavorites(movieToAdd);
  }

  @Delete("favorites/:imdbID")
  removeFromFavorites(@Param("imdbID") imdbID: string) {
    // BUG: No validation
    return this.moviesService.removeFromFavorites(imdbID);
  }

  @Get("favorites/list")
  getFavorites(@Query("page") page?: string) {
    // BUG: No error handling if page is invalid
    // BUG: If page is "0" or negative, service will return wrong results
    // BUG: If page is "abc", parseInt returns NaN, service receives NaN
    const pageNumber = page ? parseInt(page, 10) : 1;
    // BUG: Not handling case where service throws HttpException for empty favorites
    return this.moviesService.getFavorites(pageNumber);
  }
}
