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

    const pageNumber = this.parsePageNumber(page);

    return await this.moviesService.getMovieByTitle(trimmedQuery, pageNumber);
  }

  @Post("favorites")
  addToFavorites(@Body() movieToAdd: MovieDto) {
    return this.moviesService.addToFavorites(movieToAdd);
  }

  @Delete("favorites/:imdbID")
  removeFromFavorites(@Param("imdbID") imdbID: string) {
    if (!imdbID || imdbID.trim() === "") {
      throw new BadRequestException("imdbID is required");
    }

    return this.moviesService.removeFromFavorites(imdbID);
  }

  @Get("favorites/list")
  getFavorites(@Query("page") page?: string) {
    const pageNumber = this.parsePageNumber(page);
    return this.moviesService.getFavorites(pageNumber);
  }

  private parsePageNumber(page?: string): number {
    const pageNumber = page ? parseInt(page, 10) : 1;
    if (isNaN(pageNumber) || pageNumber < 1) {
      throw new BadRequestException("Page must be a positive number");
    }
    return pageNumber;
  }
}
