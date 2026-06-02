import type { IReviewRepository } from '../../../src/port/out/review-repository.port';

export function createMockReviewRepository(): jest.Mocked<IReviewRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findRecentByAuthorAndSubject: jest.fn(),
    delete: jest.fn(),
    search: jest.fn(),
  };
}
