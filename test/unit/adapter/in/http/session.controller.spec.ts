import { Test, TestingModule } from '@nestjs/testing';
import { SessionController } from '../../../../../src/adapter/in/http/session.controller';
import {
  AUTHENTICATE_USER,
  type IAuthenticateUser,
} from '../../../../../src/port/in/user/';
import type { AuthToken } from '../../../../../src/model';
import { AuthResponseDto } from '../../../../../src/adapter/in/http/dto/auth-response.dto';

describe('SessionController', () => {
  let controller: SessionController;
  let auth: jest.Mocked<IAuthenticateUser>;

  beforeEach(async () => {
    auth = { authenticate: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [{ provide: AUTHENTICATE_USER, useValue: auth }],
    }).compile();

    controller = module.get(SessionController);
  });

  describe('authenticate', () => {
    it('returns an AuthResponseDto with the access token from the port', async () => {
      const token: AuthToken = { accessToken: 'jwt-token-abc' };
      auth.authenticate.mockResolvedValue(token);

      const result = await controller.authenticate({
        username: 'alice',
        password: 'secret',
      });

      expect(auth.authenticate).toHaveBeenCalledWith({
        username: 'alice',
        password: 'secret',
      });
      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result.access_token).toBe('jwt-token-abc');
    });
  });
});
