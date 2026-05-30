export const AssociatedType = {
  TRACK: 'track',
  ALBUM: 'album',
  PODCAST: 'podcast',
  REVIEW: 'review',
  COMMENT: 'comment',
  ARTIST: 'artist',
} as const;

export type AssociatedType =
  (typeof AssociatedType)[keyof typeof AssociatedType];
