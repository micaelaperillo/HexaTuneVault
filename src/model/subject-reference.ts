import { InvalidReviewException } from '../error/review/invalid-review.exception';

export const SubjectType = {
  ALBUM: 'album',
  TRACK: 'track',
  ARTIST: 'artist',
  PODCAST: 'podcast',
} as const;

export type SubjectType = (typeof SubjectType)[keyof typeof SubjectType];

export class SubjectReference {
  constructor(
    public readonly type: SubjectType,
    public readonly id: string,
  ) {
    if (id.trim().length === 0) {
      throw new InvalidReviewException('Subject ID must be a non-empty string');
    }
  }
}
