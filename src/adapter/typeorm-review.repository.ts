import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ReviewEntity } from '../entity/review.entity';
import { ReviewModel } from '../model/review.model';
import { SubjectReference } from '../model/subject-reference';
import type { PaginatedResult } from '../common/paginated-result';
import type { ReviewSearchCriteria } from '../model/review-search-criteria';
import { SortField, SortOrder } from '../model/review-search-criteria';
import type { IReviewRepository } from '../repository/review-repository.port';

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
    const entity = this.toEntity(review);
    const saved = await this.repo.save(entity);
    return this.toModel(saved);
  }

  async findById(id: number): Promise<ReviewModel | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toModel(entity) : null;
  }

  async findRecentByAuthorAndSubject(
    authorId: string,
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
    return entity ? this.toModel(entity) : null;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async search(
    criteria: ReviewSearchCriteria,
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
    return { data: entities.map((e) => this.toModel(e)), total };
  }

  private toModel(entity: ReviewEntity): ReviewModel {
    return ReviewModel.reconstitute({
      id: entity.id,
      subjectRef: new SubjectReference(entity.subjectType, entity.subjectId),
      content: entity.content,
      rating: entity.rating,
      createdAt: entity.createdAt,
      authorId: entity.authorId,
      updatedAt: entity.updatedAt,
    });
  }

  private toEntity(model: ReviewModel): ReviewEntity {
    const entity = new ReviewEntity();
    if (model.id !== undefined) {
      entity.id = model.id;
    }
    entity.content = model.content;
    entity.rating = model.rating;
    entity.subjectType = model.subjectRef.type;
    entity.subjectId = model.subjectRef.id;
    entity.authorId = model.authorId;
    if (model.createdAt !== undefined) {
      entity.createdAt = model.createdAt;
    }
    entity.updatedAt = model.updatedAt;
    return entity;
  }
}
