import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Public()
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account with the provided details. Returns access and refresh tokens for immediate authentication. Password is hashed using bcrypt before storage.',
  })
  @ApiBody({
    description: 'User registration data',
    schema: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: {
          type: 'string',
          example: 'Emma Okonkwo',
          description: 'Full name (2-100 characters)',
          minLength: 2,
          maxLength: 100,
        },
        email: {
          type: 'string',
          format: 'email',
          example: 'emma.okonkwo@example.com',
          description: 'Valid email address (must be unique)',
        },
        password: {
          type: 'string',
          format: 'password',
          example: 'SecurePassword123!',
          description:
            'Password (minimum 8 characters, must include uppercase, lowercase, and number)',
          minLength: 8,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    content: {
      'application/json': {
        example: {
          status: true,
          data: {
            user: {
              id: '550e8400-e29b-41d4-a716-446655440001',
              name: 'Emma Okonkwo',
              email: 'emma.okonkwo@example.com',
              avatarUrl: null,
              subscriptionTier: 'FREE',
              createdAt: '2026-03-21T10:30:00.000Z',
            },
            tokens: {
              accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
          meta: {
            timestamp: '2026-03-21T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440002',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - Invalid input data',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'email must be an email',
            'password must be longer than 7 characters',
          ],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description:
      'Email already exists - A user with this email is already registered',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Email already exists' },
        error: { type: 'string', example: 'Conflict' },
      },
    },
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({
    summary: 'Login with email and password',
    description:
      'Authenticates a user with email and password credentials. Returns access and refresh tokens. Access tokens expire in 15 minutes (or 7 days if rememberMe is true). Refresh tokens expire in 7 days (or 30 days if rememberMe is true).',
  })
  @ApiBody({
    description: 'Login credentials',
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'emma.okonkwo@example.com',
          description: 'Registered email address',
        },
        password: {
          type: 'string',
          example: 'SecurePassword123!',
          description: 'User password',
        },
        rememberMe: {
          type: 'boolean',
          example: false,
          default: false,
          description: 'Keep me logged in for extended period (30 days)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    content: {
      'application/json': {
        example: {
          status: true,
          data: {
            user: {
              id: '550e8400-e29b-41d4-a716-446655440001',
              name: 'Emma Okonkwo',
              email: 'emma.okonkwo@example.com',
              avatarUrl: 'https://example.com/avatars/550e8400.jpg',
              subscriptionTier: 'PREMIUM',
              createdAt: '2026-01-15T10:00:00.000Z',
            },
            tokens: {
              accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
          meta: {
            timestamp: '2026-03-21T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440003',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - Invalid input format',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials - Email or password is incorrect',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid email or password' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async login(@Body() loginDto: LoginDto & { rememberMe?: boolean }) {
    return this.authService.login(loginDto, loginDto.rememberMe || false);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Exchanges a valid refresh token for new access and refresh tokens. The old refresh token will be invalidated. Use this endpoint when your access token expires.',
  })
  @ApiBody({
    description: 'Refresh token payload',
    schema: {
      type: 'object',
      required: ['refresh_token'],
      properties: {
        refresh_token: {
          type: 'string',
          description: 'The refresh token from previous login',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        rememberMe: {
          type: 'boolean',
          description: 'Extend refresh token expiry to 30 days',
          default: false,
          example: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    content: {
      'application/json': {
        example: {
          tokens: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          meta: {
            timestamp: '2026-03-21T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440004',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description:
      'Invalid refresh token - Token is expired, malformed, or revoked',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid refresh token' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async refresh(
    @Body('refresh_token') refreshToken: string,
    @Body('rememberMe') rememberMe?: boolean,
  ) {
    const tokens = await this.authService.refreshTokens(
      refreshToken,
      rememberMe || false,
    );
    return { tokens };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout user',
    description:
      'Invalidates the current refresh token for the authenticated user. The access token will remain valid until it expires (15 minutes).',
  })
  @ApiResponse({
    status: 204,
    description: 'Successfully logged out - No content returned',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required - Invalid or missing JWT token',
  })
  async logout(@CurrentUser('userId') userId: string) {
    await this.authService.logout(userId);
    return null;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Retrieves the profile information of the currently authenticated user based on the JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    content: {
      'application/json': {
        example: {
          status: true,
          data: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            name: 'Emma Okonkwo',
            email: 'emma.okonkwo@example.com',
            avatarUrl: 'https://example.com/avatars/550e8400.jpg',
            subscriptionTier: 'PREMIUM',
            subscriptionStatus: 'active',
            periodEnd: '2027-03-21T10:30:00.000Z',
            createdAt: '2026-01-15T10:00:00.000Z',
            updatedAt: '2026-03-21T10:30:00.000Z',
          },
          meta: {
            timestamp: '2026-03-21T10:30:00.000Z',
            request_id: '550e8400-e29b-41d4-a716-446655440005',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required - Invalid or missing JWT token',
  })
  async getMe(@CurrentUser('userId') userId: string) {
    return this.authService.getMe(userId);
  }
}
