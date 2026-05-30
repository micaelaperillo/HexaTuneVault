import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ReviewEntity } from '@entity/review.entity.js';
import { ReviewModel } from '@model/review.model.js';
import { SubjectReference } from '@model/subject-reference.js';
import type { PaginatedResult } from '@port/paginated-result.js';
import type { SearchCriteria } from '@model/search-criteria.js';
import { SortField, SortOrder } from '@model/search-criteria.js';
import type { IReviewRepository } from '@repository/review-repository.port.js';
import { ReviewMapper } from '@repository/review.mapper.js';

const SORT_FIELD_COLUMN: Record<SortField, string> = {
  [SortField.CREATED_AT]: 'review.createdAt',
  [SortField.RATING]: 'review.rating',
};

@Injectable()
export class TypeOrmReviewRepository implements IReviewRepository {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly repo: Repository<ReviewEntity>,
  ) {}

  async save(review: ReviewModel): Promise<ReviewModel> {
    const entity = ReviewMapper.toEntity(review);
    const saved = await this.repo.save(entity);
    return ReviewMapper.toDomain(saved);
  }

  async findById(id: number): Promise<ReviewModel | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? ReviewMapper.toDomain(entity) : null;
  }

  async findRecentByAuthorAndSubject(
    authorId: number,
    ref: SubjectReference,
    since: Date,
  ): Promise<ReviewModel | null> {
    const entity = await this.repo.findOne({
      where: {
        authorId,
        subjectType: ref.type,
        subjectId: ref.id,
        createdAt: MoreThan(since),
      },
    });
    return entity ? ReviewMapper.toDomain(entity) : null;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async search(
    criteria: SearchCriteria,
  ): Promise<PaginatedResult<ReviewModel>> {
    const qb = this.repo.createQueryBuilder('review');

    if (criteria.content) {
      const escaped = criteria.content.replace(/[%_\\]/g, '\\$&');
      qb.andWhere('review.content ILIKE :content', {
        content: `%${escaped}%`,
      });
    }
    if (criteria.authorId !== undefined) {
      qb.andWhere('review.authorId = :authorId', {
        authorId: criteria.authorId,
      });
    }
    if (criteria.minRating !== undefined) {
      qb.andWhere('review.rating >= :minRating', {
        minRating: criteria.minRating,
      });
    }
    if (criteria.maxRating !== undefined) {
      qb.andWhere('review.rating <= :maxRating', {
        maxRating: criteria.maxRating,
      });
    }
    if (criteria.dateFrom) {
      qb.andWhere('review.createdAt >= :dateFrom', {
        dateFrom: criteria.dateFrom,
      });
    }
    if (criteria.dateTo) {
      qb.andWhere('review.createdAt <= :dateTo', { dateTo: criteria.dateTo });
    }
    if (criteria.subjectType) {
      qb.andWhere('review.subjectType = :subjectType', {
        subjectType: criteria.subjectType,
      });
    }
    if (criteria.subjectId !== undefined) {
      qb.andWhere('review.subjectId = :subjectId', {
        subjectId: criteria.subjectId,
      });
    }

    qb.orderBy(
      SORT_FIELD_COLUMN[criteria.sortBy],
      criteria.sortOrder === SortOrder.ASC ? 'ASC' : 'DESC',
    );
    qb.skip((criteria.page - 1) * criteria.pageSize);
    qb.take(criteria.pageSize);

    const [entities, total] = await qb.getManyAndCount();
    return { data: entities.map((e) => ReviewMapper.toDomain(e)), total };
  }
}
