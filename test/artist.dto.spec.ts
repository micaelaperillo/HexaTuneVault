import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { ArtistFilterDto, ArtistGetDto } from '../src/dto';

describe('ArtistValidations', () => {
  describe('search', () => {
    function transform(data: Record<string, unknown>): ArtistFilterDto {
      return plainToInstance(ArtistFilterDto, data);
    }

    function validate(data: Record<string, unknown>): string[] {
      const dto = transform(data);
      const errors = validateSync(dto);
      return errors.flatMap((e) => Object.values(e.constraints ?? {}));
    }

    it('should trim string content via @Transform', () => {
      const dto = transform({
        q: '  The Beatles  ',
        genre: ['  Rock  '],
      } satisfies ArtistFilterDto);
      expect(dto.q).toBe('The Beatles');
      expect(dto.genre?.[0]).toBe('Rock');
    });

    it('should validate a valid request with no errors', () => {
      expect(
        validate({
          q: 'The Beatles',
        } satisfies ArtistFilterDto),
      ).toHaveLength(0);
    });

    it('should validate a valid request with genres and no errors', () => {
      expect(
        validate({
          q: 'The Beatles',
          genre: ['Rock', 'Roll'],
        } satisfies ArtistFilterDto),
      ).toHaveLength(0);
    });

    it('should fail when query is missing', () => {
      const msgs = validate({});
      expect(msgs.length).toBeGreaterThan(0);
    });

    it('should fail when query is empty', () => {
      const msgs = validate({
        q: '',
      } satisfies ArtistFilterDto);
      expect(msgs.length).toBeGreaterThan(0);
    });

    it('should fail when a genre is invalid', () => {
      const msgs = validate({
        q: 'The Beatles',
        genre: ['Rock', '  '],
      } satisfies ArtistFilterDto);
      expect(msgs.length).toBeGreaterThan(0);
    });
  });

  describe('get', () => {
    function transform(data: Record<string, unknown>): ArtistGetDto {
      return plainToInstance(ArtistGetDto, data);
    }

    function validate(data: Record<string, unknown>): string[] {
      const dto = transform(data);
      const errors = validateSync(dto);
      return errors.flatMap((e) => Object.values(e.constraints ?? {}));
    }

    it('should trim string content via @Transform', () => {
      const dto = transform({
        name: '  The Beatles  ',
      } satisfies ArtistGetDto);
      expect(dto.name).toBe('The Beatles');
    });

    it('should validate a valid request with no errors', () => {
      expect(
        validate({
          name: 'The Beatles',
        } satisfies ArtistGetDto),
      ).toHaveLength(0);
    });

    it('should fail when name is missing', () => {
      const msgs = validate({});
      expect(msgs.length).toBeGreaterThan(0);
    });

    it('should fail when name is empty', () => {
      const msgs = validate({
        name: '',
      } satisfies ArtistGetDto);
      expect(msgs.length).toBeGreaterThan(0);
    });
  });
});
