import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateUserDto } from '../src/dto/create-user.dto';

const validUser = {
  username: 'ada',
  password: 'secret',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  biography: '',
  profilePictureUrl: '',
};

describe('CreateUserDto location', () => {
  it('is optional', () => {
    const dto = plainToInstance(CreateUserDto, validUser);

    expect(validateSync(dto)).toHaveLength(0);
  });

  it('accepts a location up to 256 characters', () => {
    const dto = plainToInstance(CreateUserDto, {
      ...validUser,
      location: 'a'.repeat(256),
    });

    expect(validateSync(dto)).toHaveLength(0);
  });

  it('rejects a location longer than 256 characters', () => {
    const dto = plainToInstance(CreateUserDto, {
      ...validUser,
      location: 'a'.repeat(257),
    });

    expect(validateSync(dto).length).toBeGreaterThan(0);
  });

  it('trims surrounding whitespace', () => {
    const dto = plainToInstance(CreateUserDto, {
      ...validUser,
      location: '  Buenos Aires  ',
    });

    expect(dto.location).toBe('Buenos Aires');
  });
});
