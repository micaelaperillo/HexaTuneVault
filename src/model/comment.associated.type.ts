export const AssociatedType = {
  TRACK: 'track',
  ALBUM: 'album',
  PODCAST: 'podcast',
  REVIEW: 'review',
  COMMENT: 'comment',
} as const;

export type AssociatedType =
  (typeof AssociatedType)[keyof typeof AssociatedType];
