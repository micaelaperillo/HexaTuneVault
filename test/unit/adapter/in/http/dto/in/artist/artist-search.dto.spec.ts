import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ArtistSearchDto } from '../../../../../../../../src/adapter/in/http/dto/in/artist/artist-search.dto';

// Answers the review question on @ToArray(): a single `genre` query param must
// coerce to a one-element array so the `each` validators apply uniformly.
describe('ArtistSearchDto @ToArray() genre coercion', () => {
  it('wraps a single genre string in an array', () => {
    const dto = plainToInstance(ArtistSearchDto, {
      q: 'radiohead',
      genre: 'rock',
    });
    expect(dto.genre).toEqual(['rock']);
  });

  it('leaves an array of genres untouched', () => {
    const dto = plainToInstance(ArtistSearchDto, {
      q: 'radiohead',
      genre: ['rock', 'pop'],
    });
    expect(dto.genre).toEqual(['rock', 'pop']);
  });

  it('validates a single genre after coercion', async () => {
    const dto = plainToInstance(ArtistSearchDto, {
      q: 'radiohead',
      genre: 'rock',
    });
    expect(await validate(dto)).toHaveLength(0);
  });
});
