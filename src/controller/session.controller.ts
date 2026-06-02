import type { JwtModel } from '../model';

import { Controller, Inject, Post, Body } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { AUTHENTICATE_USER, type IAuthenticateUser } from '../port/user';

import { LoginUserDto } from '../dto/login-user.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { Public } from '../infrastructure/auth/public.decorator';

@Public()
@Controller('api/sessions')
export class SessionController {
  constructor(
    @Inject(AUTHENTICATE_USER)
    private readonly auth: IAuthenticateUser,
  ) {}

  @Post()
  async authenticate(@Body() dto: LoginUserDto): Promise<AuthResponseDto> {
    return SessionController.toResponse(await this.auth.authenticate(dto));
  }

  private static toResponse(this: void, token: JwtModel) {
    return plainToInstance(AuthResponseDto, token, {
      excludeExtraneousValues: true,
    });
  }
}
