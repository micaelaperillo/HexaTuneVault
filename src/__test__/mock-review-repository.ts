import type { IReviewRepository } from '@repository/review-repository.port.js';

export function createMockReviewRepository(): jest.Mocked<IReviewRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findRecentByAuthorAndSubject: jest.fn(),
    delete: jest.fn(),
    search: jest.fn(),
  };
}
