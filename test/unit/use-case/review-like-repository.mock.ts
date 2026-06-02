import type { IReviewLikeRepository } from '../../../src/repository/review-like-repository.port';

export function createMockReviewLikeRepository(): jest.Mocked<IReviewLikeRepository> {
  return {
    addLike: jest.fn(),
    removeLike: jest.fn(),
    countLikes: jest.fn(),
    hasLike: jest.fn(),
  };
}
