import { ReviewService } from '../../../src/use-case/review.service';
import { createMockReviewRepository } from './review-repository.mock';
import { createMockReviewLikeRepository } from './review-like-repository.mock';
import type { IReviewRepository } from '../../../src/port/out/review-repository.port';
import type { IReviewLikeRepository } from '../../../src/port/out/review-like-repository.port';
import type { IReviewConfig } from '../../../src/port/in/review/review-config.port';
import type { ReviewFilters } from '../../../src/model/review.filter';
import { SortField, SortOrder } from '../../../src/model/review.filter';
import type { CreateReviewCommand } from '../../../src/port/in/review/create-review.port';
import type { ReviewModel, UserModel } from '../../../src/model';
import { ReviewCooldownException } from '../../../src/error/review/review-cooldown.exception';
import { ReviewNotFoundException } from '../../../src/error/review/review-not-found.exception';
import { ForbiddenDeletionException } from '../../../src/error/review/forbidden-deletion.exception';

describe('ReviewService', () => {
  let service: ReviewService;
  let reviewRepo: jest.Mocked<IReviewRepository>;
  let likeRepo: jest.Mocked<IReviewLikeRepository>;
  const config: IReviewConfig = { cooldownSeconds: 60 };
  const mockUser = { id: 1 } as unknown as UserModel;
  const mockUser2 = { id: 2 } as unknown as UserModel;

  const reviewBy = (author: UserModel): ReviewModel => ({
    id: 1,
    subject: { album: '1' },
    content: 'Okay',
    rating: 3,
    createdAt: new Date(),
    author,
    updatedAt: null,
  });

  beforeEach(() => {
    reviewRepo = createMockReviewRepository();
    likeRepo = createMockReviewLikeRepository();
    service = new ReviewService(reviewRepo, likeRepo, config);
  });

  describe('create', () => {
    const cmd: CreateReviewCommand = {
      subject: { album: '1' },
      content: 'Great stuff',
      rating: 5,
      author: mockUser,
    };

    it('creates and saves a review', async () => {
      reviewRepo.findRecentByAuthorAndSubject.mockResolvedValue(null);
      const saved = reviewBy(mockUser);
      reviewRepo.create.mockResolvedValue(saved);

      const result = await service.create(cmd);

      expect(reviewRepo.findRecentByAuthorAndSubject).toHaveBeenCalledWith(
        mockUser,
        { album: '1' },
        expect.any(Date),
      );
      expect(reviewRepo.create).toHaveBeenCalledWith(cmd);
      expect(result).toEqual(saved);
    });

    it('throws ReviewCooldownException when reviewed recently', async () => {
      reviewRepo.findRecentByAuthorAndSubject.mockResolvedValue(
        reviewBy(mockUser),
      );

      await expect(service.create(cmd)).rejects.toThrow(
        ReviewCooldownException,
      );
      expect(reviewRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('throws ReviewNotFoundException when the review does not exist', async () => {
      reviewRepo.findById.mockResolvedValue(null);

      await expect(
        service.delete({ reviewId: 1, requesterId: mockUser }),
      ).rejects.toThrow(ReviewNotFoundException);
    });

    it('throws ForbiddenDeletionException when requester is not the author', async () => {
      reviewRepo.findById.mockResolvedValue(reviewBy(mockUser2));

      await expect(
        service.delete({ reviewId: 1, requesterId: mockUser }),
      ).rejects.toThrow(ForbiddenDeletionException);
    });

    it('deletes when requester is the owner', async () => {
      reviewRepo.findById.mockResolvedValue(reviewBy(mockUser));

      await service.delete({ reviewId: 1, requesterId: mockUser });

      expect(reviewRepo.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('get', () => {
    it('throws ReviewNotFoundException when not found', async () => {
      reviewRepo.findById.mockResolvedValue(null);

      await expect(service.get(1)).rejects.toThrow(ReviewNotFoundException);
    });

    it('returns the review when found', async () => {
      const review = reviewBy(mockUser);
      reviewRepo.findById.mockResolvedValue(review);

      const result = await service.get(1);

      expect(result).toEqual(review);
      expect(reviewRepo.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('search', () => {
    const filters: ReviewFilters = {
      page: 1,
      pageSize: 10,
      sortBy: SortField.CREATED_AT,
      sortOrder: SortOrder.DESC,
    };

    it('returns results from the repository', async () => {
      const review = reviewBy(mockUser);
      reviewRepo.search.mockResolvedValue({
        items: [review],
        total: 1,
        page: 1,
        pageSize: 10,
      });

      const result = await service.search(filters);

      expect(reviewRepo.search).toHaveBeenCalledWith(filters);
      expect(result.total).toBe(1);
      expect(result.items[0]).toEqual(review);
    });

    it('passes filters through unchanged', async () => {
      const filtered: ReviewFilters = {
        ...filters,
        content: 'x',
        authorId: 5,
        minRating: 3,
      };
      reviewRepo.search.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
      });

      await service.search(filtered);

      expect(reviewRepo.search).toHaveBeenCalledWith(filtered);
    });
  });

  describe('like', () => {
    it('delegates to addLike (idempotent, no existence pre-check)', async () => {
      await service.like(1, 7);

      expect(likeRepo.addLike).toHaveBeenCalledWith(1, 7);
      expect(reviewRepo.findById).not.toHaveBeenCalled();
    });

    it('propagates ReviewNotFoundException surfaced by the repository', async () => {
      likeRepo.addLike.mockRejectedValue(new ReviewNotFoundException());

      await expect(service.like(999, 7)).rejects.toThrow(
        ReviewNotFoundException,
      );
    });
  });

  describe('unlike', () => {
    it('removes the like when the review exists (idempotent)', async () => {
      reviewRepo.findById.mockResolvedValue(reviewBy(mockUser));

      await service.unlike(1, 7);

      expect(likeRepo.removeLike).toHaveBeenCalledWith(1, 7);
    });

    it('throws ReviewNotFoundException when the review is missing', async () => {
      reviewRepo.findById.mockResolvedValue(null);

      await expect(service.unlike(999, 7)).rejects.toThrow(
        ReviewNotFoundException,
      );
      expect(likeRepo.removeLike).not.toHaveBeenCalled();
    });
  });

  describe('count', () => {
    it('returns the like count when the review exists', async () => {
      reviewRepo.findById.mockResolvedValue(reviewBy(mockUser));
      likeRepo.countLikes.mockResolvedValue(12);

      const result = await service.count(1);

      expect(result).toBe(12);
      expect(likeRepo.countLikes).toHaveBeenCalledWith(1);
    });

    it('throws ReviewNotFoundException when the review is missing', async () => {
      reviewRepo.findById.mockResolvedValue(null);

      await expect(service.count(999)).rejects.toThrow(ReviewNotFoundException);
      expect(likeRepo.countLikes).not.toHaveBeenCalled();
    });
  });

  describe('hasLiked', () => {
    it('delegates to the like repository', async () => {
      likeRepo.hasLike.mockResolvedValue(true);

      const result = await service.hasLiked(1, 7);

      expect(result).toBe(true);
      expect(likeRepo.hasLike).toHaveBeenCalledWith(1, 7);
    });
  });
});
