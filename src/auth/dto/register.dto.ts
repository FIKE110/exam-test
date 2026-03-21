import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProfessionCode } from '../../common/enums/profession.enum';
import { ExamTypeCode } from '../../common/enums/exam-type.enum';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    required: true,
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'SecurePass123!',
    required: true,
    minLength: 8,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: true,
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName!: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: true,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName!: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Date of birth (ISO 8601 format)',
    example: '1995-06-15',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Please provide a valid date' })
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Profession code',
    example: 'STUDENT',
    required: true,
    enum: ProfessionCode,
  })
  @IsEnum(ProfessionCode, { message: 'Invalid profession code' })
  @IsNotEmpty({ message: 'Profession is required' })
  profession!: ProfessionCode;

  @ApiProperty({
    description: 'Array of exam type codes',
    example: ['WAEC', 'JAMB'],
    required: true,
    enum: ExamTypeCode,
    isArray: true,
  })
  @IsArray({ message: 'Exam types must be an array' })
  @IsEnum(ExamTypeCode, { each: true, message: 'Invalid exam type code' })
  @IsNotEmpty({ message: 'At least one exam type is required' })
  examTypes!: ExamTypeCode[];
}
