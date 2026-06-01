export const AssociatedType = {
  REVIEW: 'review',
  COMMENT: 'comment',
} as const;

export type AssociatedType =
  (typeof AssociatedType)[keyof typeof AssociatedType];
