import { ApiProperty } from '@nestjs/swagger';
import { ProfessionCode } from '../../common/enums/profession.enum';
import { ExamTypeCode } from '../../common/enums/exam-type.enum';

class AuthTokensDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ nullable: true })
  phone: string | null;

  @ApiProperty({ nullable: true })
  dateOfBirth: Date | null;

  @ApiProperty({ enum: ProfessionCode, nullable: true })
  profession: ProfessionCode | null;

  @ApiProperty({ enum: ExamTypeCode, isArray: true })
  examTypes: ExamTypeCode[];

  @ApiProperty()
  subscriptionTier: string;

  @ApiProperty()
  subscriptionStatus: string;

  @ApiProperty({ nullable: true })
  subscriptionExpiresAt: Date | null;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: AuthTokensDto })
  tokens: AuthTokensDto;
}
