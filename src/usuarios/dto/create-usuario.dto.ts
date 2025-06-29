import { IsEmail, IsEnum, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ROLES } from '../../helpers/roles.consts';

export class CreateUserDto {
  @IsString()
  @Length(4, 15)
  username: string;

  @IsString()
  @Length(8, 100)
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'Password must have at least one uppercase and one digit'
  })
  password: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(3, 15)
  name: string;

  @IsString()
  @Length(3, 15)
  surname: string;

  @IsNotEmpty()
  dateOfBirth: Date;

  @IsString()
  @Length(0, 50)
  description?: string;

  @IsString()
  @Length(0, 50)
  image: string;

  @IsEnum(ROLES)
  role: string;
}