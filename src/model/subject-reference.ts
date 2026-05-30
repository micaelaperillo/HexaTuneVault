import { InvalidReviewException } from '@error/review/invalid-review.exception.js';

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
    public readonly id: number,
  ) {
    if (!Number.isInteger(id) || id < 1) {
      throw new InvalidReviewException('Subject ID must be a positive integer');
    }
  }
}
