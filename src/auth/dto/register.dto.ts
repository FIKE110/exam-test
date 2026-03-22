import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
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
    description: 'User full name',
    example: 'John Doe',
    required: true,
  })
  @IsString({ message: 'Full name must be a string' })
  @IsNotEmpty({ message: 'Full name is required' })
  fullName!: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
    required: true,
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  phone!: string;

  @ApiProperty({
    description: 'Date of birth (ISO 8601 format)',
    example: '1995-06-15',
    required: true,
  })
  @IsNotEmpty({ message: 'Date of birth is required' })
  @IsDateString({}, { message: 'Please provide a valid date' })
  dateOfBirth!: string;

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
    description: 'Exam type code',
    example: 'WAEC',
    required: true,
    enum: ExamTypeCode,
  })
  @IsEnum(ExamTypeCode, { message: 'Invalid exam type code' })
  @IsNotEmpty({ message: 'Exam type is required' })
  examType!: ExamTypeCode;
}
