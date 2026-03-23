import { ProfessionCode } from '../../common/enums/profession.enum';
import { ExamTypeCode } from '../../common/enums/exam-type.enum';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl: string | null;
  phone: string | null;
  dateOfBirth: Date | null;
  profession: ProfessionCode | null;
  examTypes: ExamTypeCode[];
  subscriptionTier: string;
  subscriptionStatus: string;
  subscriptionExpiresAt: Date | null;
}

export interface AdminResponse {
  id: string;
  email: string;
  username: string;
  role: string;
}

export interface AuthResponse {
  role: 'user' | 'admin';
  user?: UserResponse;
  admin?: AdminResponse;
  tokens: AuthTokens;
}
