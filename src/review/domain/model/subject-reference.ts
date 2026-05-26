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
  ) {}
}
