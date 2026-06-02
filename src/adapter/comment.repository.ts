import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, SelectQueryBuilder } from 'typeorm';
import { CommentEntity } from '../entity/comment.entity';
import { ICommentRepository } from '../repository/i-comment.repository';
import { CommentModel } from '../model/comment.model';
import { CommentFilters } from '../model/comment.filter';
import { CommentDBException } from '../error/comment/comment-db.exception';
import { ReviewModel, UserModel } from '../model';
import { SubjectReference } from '../model/subject-reference';

@Injectable()
export class CommentRepository implements ICommentRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly repo: Repository<CommentEntity>,
  ) {}

  async create(
    comment: Omit<
      CommentModel,
      'id' | 'createdAt' | 'likes' | 'createdBy' | 'parentReview'
    > & {
      createdBy: Pick<UserModel, 'id'>;
      parentReview: Pick<ReviewModel, 'id'>;
    },
  ): Promise<CommentModel> {
    return this.run(async () => {
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
    });
  }

  async findById(id: number): Promise<CommentModel | null> {
    const entity = await this.run(() =>
      this.baseQuery().where('comment.id = :id', { id }).getOne(),
    );
    return entity ? this.toModel(entity) : null;
  }

  async deleteById(id: number): Promise<void> {
    await this.run(() => this.repo.delete(id));
  }

  async findReplies(parentCommentId: number): Promise<CommentModel[]> {
    const entities = await this.run(() =>
      this.baseQuery()
        .where('comment.parentComment = :parentCommentId', { parentCommentId })
        .getMany(),
    );
    return entities.map((e) => this.toModel(e));
  }

  async hasLike(commentId: number, userId: number): Promise<boolean> {
    return this.run(() => this.likeExists(commentId, userId));
  }

  async addLike(commentId: number, userId: number): Promise<void> {
    await this.run(async () => {
      if (!(await this.likeExists(commentId, userId))) {
        await this.repo
          .createQueryBuilder()
          .relation(CommentEntity, 'likedBy')
          .of(commentId)
          .add(userId);
      }
    });
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

  async removeLike(commentId: number, userId: number): Promise<void> {
    await this.run(() =>
      this.repo
        .createQueryBuilder()
        .relation(CommentEntity, 'likedBy')
        .of(commentId)
        .remove(userId),
    );
  }

  async search(filters: CommentFilters): Promise<CommentModel[]> {
    const qb = this.baseQuery().where('comment.parentComment IS NULL');
    if (filters.createdById !== undefined) {
      qb.andWhere('comment.createdBy = :createdById', {
        createdById: filters.createdById,
      });
    }
    if (filters.content !== undefined) {
      qb.andWhere('comment.content ILIKE :content', {
        content: `%${filters.content}%`,
      });
    }
    if (filters.parentReviewId !== undefined) {
      qb.andWhere('comment.parentReview = :parentReviewId', {
        parentReviewId: filters.parentReviewId,
      });
    }
    const entities = await this.run(() => qb.getMany());
    return entities.map((e) => this.toModel(e));
  }

  private baseQuery(): SelectQueryBuilder<CommentEntity> {
    return this.repo
      .createQueryBuilder('comment')
      .loadRelationIdAndMap('comment.likedByIds', 'comment.likedBy');
  }

  private toModel(entity: CommentEntity): CommentModel {
    return {
      id: entity.id,
      content: entity.content,
      createdAt: entity.createdAt,
      createdBy: entity.createdBy,
      parentReview: ReviewModel.reconstitute({
        ...entity.parentReview,
        author: entity.parentReview.author,
        subjectRef: new SubjectReference(
          entity.parentReview.subjectType,
          entity.parentReview.subjectId,
        ),
      }),
      parentCommentId: entity.parentComment?.id ?? null,
      likes: entity.likedByIds?.length ?? 0,
    };
  }

  private async run<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof QueryFailedError)
        throw new CommentDBException(e.message);
      throw e;
    }
  }
}
