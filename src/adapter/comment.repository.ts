import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { MapErrors } from 'error-mapper-decorator';
import { CommentEntity } from '../entity/comment.entity';
import { ICommentRepository } from '../repository/comment-repository.port';
import type { CommentModel } from '../model/comment.model';
import type { CommentFilters } from '../model/comment.filter';
import type { ReviewModel, UserModel } from '../model';
import type { Page } from '../model';
import { buildSubject } from '../model/review-subject';
import { escapeLike } from './like-escape';
import { commentPersistenceFailure } from './comment-error-mappings';

@Injectable()
export class CommentRepository implements ICommentRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly repo: Repository<CommentEntity>,
  ) {}

  @MapErrors(commentPersistenceFailure)
  async create(
    comment: Omit<
      CommentModel,
      'id' | 'createdAt' | 'likes' | 'createdBy' | 'parentReview'
    > & {
      createdBy: Pick<UserModel, 'id'>;
      parentReview: Pick<ReviewModel, 'id'>;
    },
  ): Promise<CommentModel> {
    const entity = this.repo.create({
      content: comment.content,
      createdBy: comment.createdBy,
      parentReview: comment.parentReview,
      parentComment:
        comment.parentCommentId != null
          ? { id: comment.parentCommentId }
          : null,
    });

    const saved = await this.repo.save(entity);
    const reloaded = await this.baseQuery()
      .where('comment.id = :id', { id: saved.id })
      .getOneOrFail();
    return this.toModel(reloaded);
  }

  @MapErrors(commentPersistenceFailure)
  async findById(id: number): Promise<CommentModel | null> {
    const entity = await this.baseQuery()
      .where('comment.id = :id', { id })
      .getOne();
    return entity ? this.toModel(entity) : null;
  }

  @MapErrors(commentPersistenceFailure)
  async deleteById(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  @MapErrors(commentPersistenceFailure)
  async findReplies(parentCommentId: number): Promise<CommentModel[]> {
    const entities = await this.baseQuery()
      .where('comment.parentComment = :parentCommentId', { parentCommentId })
      .getMany();
    return entities.map((e) => this.toModel(e));
  }

  @MapErrors(commentPersistenceFailure)
  async hasLike(commentId: number, userId: number): Promise<boolean> {
    return this.likeExists(commentId, userId);
  }

  @MapErrors(commentPersistenceFailure)
  async addLike(commentId: number, userId: number): Promise<void> {
    if (!(await this.likeExists(commentId, userId))) {
      await this.repo
        .createQueryBuilder()
        .relation(CommentEntity, 'likedBy')
        .of(commentId)
        .add(userId);
    }
  }

  @MapErrors(commentPersistenceFailure)
  async removeLike(commentId: number, userId: number): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .relation(CommentEntity, 'likedBy')
      .of(commentId)
      .remove(userId);
  }

  @MapErrors(commentPersistenceFailure)
  async search(filters: CommentFilters): Promise<Page<CommentModel>> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize =
      filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;

    const qb = this.baseQuery().where('comment.parentComment IS NULL');
    if (filters.createdById !== undefined) {
      qb.andWhere('comment.createdBy = :createdById', {
        createdById: filters.createdById,
      });
    }
    if (filters.content !== undefined) {
      qb.andWhere('comment.content ILIKE :content', {
        content: `%${escapeLike(filters.content)}%`,
      });
    }
    if (filters.parentReviewId !== undefined) {
      qb.andWhere('comment.parentReview = :parentReviewId', {
        parentReviewId: filters.parentReviewId,
      });
    }
    const [entities, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return {
      items: entities.map((e) => this.toModel(e)),
      page,
      pageSize,
      total,
    };
  }

  private async likeExists(
    commentId: number,
    userId: number,
  ): Promise<boolean> {
    const count = await this.repo
      .createQueryBuilder('comment')
      .innerJoin('comment.likedBy', 'user', 'user.id = :userId', { userId })
      .where('comment.id = :commentId', { commentId })
      .getCount();
    return count > 0;
  }

  private baseQuery(): SelectQueryBuilder<CommentEntity> {
    return this.repo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.createdBy', 'createdBy')
      .leftJoinAndSelect('comment.parentReview', 'parentReview')
      .leftJoinAndSelect('parentReview.author', 'parentReviewAuthor')
      .leftJoinAndSelect('comment.parentComment', 'parentComment')
      .loadRelationIdAndMap('comment.likedByIds', 'comment.likedBy');
  }

  private toModel(entity: CommentEntity): CommentModel {
    return {
      id: entity.id,
      content: entity.content,
      createdAt: entity.createdAt,
      createdBy: entity.createdBy,
      parentReview: {
        id: entity.parentReview.id,
        subject: buildSubject(
          entity.parentReview.subjectType,
          entity.parentReview.subjectId,
        ),
        content: entity.parentReview.content,
        rating: entity.parentReview.rating,
        createdAt: entity.parentReview.createdAt,
        author: entity.parentReview.author,
        updatedAt: entity.parentReview.updatedAt,
      },
      parentCommentId: entity.parentComment?.id ?? null,
      likes: entity.likedByIds?.length ?? 0,
    };
  }
}
