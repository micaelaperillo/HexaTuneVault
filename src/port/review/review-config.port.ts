export const REVIEW_CONFIG = Symbol('IReviewConfig');

export interface IReviewConfig {
  readonly cooldownSeconds: number;
}
