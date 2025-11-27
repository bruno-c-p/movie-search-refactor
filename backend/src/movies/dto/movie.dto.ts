import { IsInt, IsNotEmpty, IsString, IsUrl, Max, Min } from "class-validator";

export class MovieDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  imdbID: string;

  @IsInt()
  @Min(1900)
  @Max(2100)
  year: number;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  poster: string;
}
