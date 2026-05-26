import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewEntity } from '@review/entity/review.entity.js';
import { ReviewModel } from '@review/domain/model/review.model.js';
import { SubjectReference } from '@review/domain/model/subject-reference.js';
import {
  SearchCriteria,
  SortField,
  SortOrder,
} from '@review/domain/model/search-criteria.js';
import type { IReviewRepository } from '@review/port/out/review-repository.port.js';
import { DuplicateReviewException } from '@review/domain/exception/duplicate-review.exception.js';
import { ReviewNotFoundException } from '@review/domain/exception/review-not-found.exception.js';
import { ReviewMapper } from './mapper/review.mapper.js';

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
    try {
      const saved = await this.repo.save(entity);
      return ReviewMapper.toDomain(saved);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === '23505'
      ) {
        throw new DuplicateReviewException();
      }
      throw error;
    }
  }

  async findById(id: number): Promise<ReviewModel | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? ReviewMapper.toDomain(entity) : null;
  }

  async findByAuthorAndSubject(
    authorId: number,
    ref: SubjectReference,
  ): Promise<ReviewModel | null> {
    const entity = await this.repo.findOne({
      where: { authorId, subjectType: ref.type, subjectId: ref.id },
    });
    return entity ? ReviewMapper.toDomain(entity) : null;
  }

  async delete(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new ReviewNotFoundException();
    }
  }

  async search(
    criteria: SearchCriteria,
  ): Promise<{ data: ReviewModel[]; total: number }> {
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
