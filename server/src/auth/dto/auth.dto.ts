import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'john_doe or john@example.com', description: 'Username or Email of the user' })
  @IsString()
  @IsNotEmpty({ message: 'Username or Email is required' })
  username: string;

  @ApiProperty({ example: 'password123', description: 'Password for the account' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'john_doe', description: 'Username for the new account' })
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address of the user' })
  @IsEmail({}, { message: 'Email must be valid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password (min 6 characters)' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
