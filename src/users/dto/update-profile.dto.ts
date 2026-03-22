import { IsOptional, IsString, IsUrl, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: false,
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Full name must be a string' })
  @Length(2, 100, {
    message: 'Full name must be between 2 and 100 characters',
  })
  fullName?: string;

  @ApiProperty({
    description: 'URL to the user avatar image',
    example: 'https://example.com/avatars/john-doe.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Avatar URL must be a valid URL' })
  avatarUrl?: string;
}
