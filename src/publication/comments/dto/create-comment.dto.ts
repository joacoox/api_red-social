import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCommentDto {

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  createdAt?: Date;

  username?:string;

  image?:string;
  
}
