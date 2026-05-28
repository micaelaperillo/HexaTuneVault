import type { IReviewRepository } from '@review/port/out/review-repository.port.js';

export function createMockReviewRepository(): jest.Mocked<IReviewRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findRecentByAuthorAndSubject: jest.fn(),
    delete: jest.fn(),
    search: jest.fn(),
  };
}
