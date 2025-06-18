import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePublicationDto {

  userId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  image: string;
}

