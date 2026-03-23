import {
  IsOptional,
  IsString,
  IsUrl,
  IsEnum,
  IsDateString,
  Length,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProfessionCode } from '../../common/enums/profession.enum';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'User full name',
    example: 'Emma Okonkwo',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Full name must be a string' })
  @Length(2, 100, {
    message: 'Full name must be between 2 and 100 characters',
  })
  fullName?: string;

  @ApiPropertyOptional({
    description: 'URL to the user avatar image',
    example: 'https://example.com/avatars/emma.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Avatar URL must be a valid URL' })
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+2348012345678',
    minLength: 7,
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Length(7, 20, { message: 'Phone must be between 7 and 20 characters' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'User date of birth (ISO 8601 date string)',
    example: '1995-06-15',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid date string' })
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'User profession',
    example: ProfessionCode.STUDENT,
    enum: ProfessionCode,
    enumName: 'ProfessionCode',
  })
  @IsOptional()
  @IsEnum(ProfessionCode, { message: 'Profession must be a valid profession' })
  profession?: ProfessionCode;
}
