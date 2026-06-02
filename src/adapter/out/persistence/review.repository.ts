import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, TypeORMError } from 'typeorm';
import { ReviewEntity } from './entity/review.entity';
import type { ReviewModel } from '../../../model/review.model';
import { splitSubject, buildSubject } from '../../../model/review-subject';
import type { ReviewSubject } from '../../../model/review-subject';
import type { Page } from '../../../model';
import type { ReviewFilters } from '../../../model/review-filter.model';
import { SortField, SortOrder } from '../../../model/review-filter.model';
import type { IReviewRepository } from '../../../port/out/review-repository.port';
import { MapErrors } from 'error-mapper-decorator';
import { ReviewRepositoryException } from '../../../port/out/persistence.error';
import type { UserModel } from '../../../model';
import { UserEntity } from './entity';
import { escapeLike } from './like-escape';

const SORT_FIELD_COLUMN: Record<SortField, string> = {
  [SortField.CREATED_AT]: 'review.createdAt',
  [SortField.RATING]: 'review.rating',
};

@Injectable()
@MapErrors({
  from: TypeORMError,
  to: (error) => new ReviewRepositoryException(error.message),
})
export class ReviewRepository implements IReviewRepository {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly repo: Repository<ReviewEntity>,
  ) {}
  async create(
    review: Omit<ReviewModel, 'id' | 'createdAt' | 'updatedAt' | 'author'> & {
      author: Pick<UserModel, 'id'>;
    },
  ): Promise<ReviewModel> {
    const { type, id } = splitSubject(review.subject);
    const entity = this.repo.create({
      content: review.content,
      rating: review.rating,
      subjectType: type,
      subjectId: id,
      author: Object.assign(new UserEntity(), { id: review.author.id }),
    });
    const saved = await this.repo.save(entity);
    return ReviewRepository.toModel(saved);
  }

  async findById(id: number): Promise<ReviewModel | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: { author: true },
    });
    return entity ? ReviewRepository.toModel(entity) : null;
  }

  async findRecentByAuthorAndSubject(
    author: Pick<UserModel, 'id'>,
    subject: ReviewSubject,
    since: Date,
  ): Promise<ReviewModel | null> {
    const { type, id } = splitSubject(subject);
    const entity = await this.repo.findOne({
      where: {
        author,
        subjectType: type,
        subjectId: id,
        createdAt: MoreThan(since),
      },
    });
    return entity ? ReviewRepository.toModel(entity) : null;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async search(filters: ReviewFilters): Promise<Page<ReviewModel>> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize =
      filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;

    const qb = this.repo
      .createQueryBuilder('review')
      .innerJoinAndSelect('review.author', 'user');

    if (filters.content) {
      qb.andWhere('review.content ILIKE :content', {
        content: `%${escapeLike(filters.content)}%`,
      });
    }
    if (filters.authorId !== undefined) {
      qb.andWhere('review.author.id = :authorId', {
        authorId: filters.authorId,
      });
    }
    if (filters.minRating !== undefined) {
      qb.andWhere('review.rating >= :minRating', {
        minRating: filters.minRating,
      });
    }
    if (filters.maxRating !== undefined) {
      qb.andWhere('review.rating <= :maxRating', {
        maxRating: filters.maxRating,
      });
    }
    if (filters.dateFrom) {
      qb.andWhere('review.createdAt >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }
    if (filters.dateTo) {
      qb.andWhere('review.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }
    if (filters.subjectType) {
      qb.andWhere('review.subjectType = :subjectType', {
        subjectType: filters.subjectType,
      });
    }
    if (filters.subjectId !== undefined) {
      qb.andWhere('review.subjectId = :subjectId', {
        subjectId: filters.subjectId,
      });
    }

    qb.orderBy(
      SORT_FIELD_COLUMN[filters.sortBy],
      filters.sortOrder === SortOrder.ASC ? 'ASC' : 'DESC',
    );
    qb.skip((page - 1) * pageSize);
    qb.take(pageSize);

    const [entities, total] = await qb.getManyAndCount();
    return {
      items: entities.map(ReviewRepository.toModel),
      total,
      page,
      pageSize,
    };
  }

  private static toModel(this: void, entity: ReviewEntity): ReviewModel {
    return {
      id: entity.id,
      subject: buildSubject(entity.subjectType, entity.subjectId),
      content: entity.content,
      rating: entity.rating,
      createdAt: entity.createdAt,
      author: entity.author,
      updatedAt: entity.updatedAt,
    };
  }
}
