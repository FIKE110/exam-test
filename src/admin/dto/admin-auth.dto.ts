import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginDto {
  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@examtest.com',
    required: true,
    type: 'string',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({
    description: 'Admin password',
    example: 'AdminPass123!',
    required: true,
    type: 'string',
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}

export class AdminRegisterDto {
  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@examtest.com',
    required: true,
    type: 'string',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({
    description: 'Admin username (unique)',
    example: 'admin1',
    required: true,
    type: 'string',
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  username!: string;

  @ApiProperty({
    description: 'Admin password (minimum 8 characters)',
    example: 'AdminPass123!',
    required: true,
    type: 'string',
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'JWT refresh token from login response',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token!: string;
}

export class AdminResponseDto {
  @ApiProperty({
    description: 'Admin UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({ description: 'Admin email', example: 'admin@examtest.com' })
  email: string;

  @ApiProperty({ description: 'Admin username', example: 'admin1' })
  username: string;

  @ApiProperty({
    description: 'Admin role',
    example: 'content_admin',
    enum: ['super_admin', 'content_admin', 'support_admin'],
  })
  role: string;
}

export class TokensResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}

export class AdminAuthResponseDto {
  @ApiProperty({ description: 'Admin data', type: AdminResponseDto })
  admin: AdminResponseDto;

  @ApiProperty({ description: 'JWT tokens', type: TokensResponseDto })
  tokens: TokensResponseDto;
}

export class RefreshResponseDto {
  @ApiProperty({ description: 'JWT tokens', type: TokensResponseDto })
  tokens: TokensResponseDto;
}
