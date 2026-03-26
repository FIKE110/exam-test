import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatRequestDto {
  @ApiProperty({
    description: 'User message or question to the AI assistant',
    example: 'How do I prepare for the PLAB exam?',
    required: true,
    maxLength: 5000,
  })
  @IsString({ message: 'Prompt must be a string' })
  @IsNotEmpty({ message: 'Prompt is required' })
  @MaxLength(5000, { message: 'Prompt must not exceed 5000 characters' })
  prompt!: string;
}
