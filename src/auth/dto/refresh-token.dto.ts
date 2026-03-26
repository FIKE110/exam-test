import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'JWT refresh token from login response',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: true,
  })
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  refresh_token!: string;

  @ApiPropertyOptional({
    description: 'Extend refresh token expiry to 30 days',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'rememberMe must be a boolean' })
  rememberMe?: boolean;
}
