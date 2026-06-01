import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Repository, QueryFailedError } from 'typeorm';

import { CommentEntity, UserEntity } from '../entity';
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
      'id' | 'createdAt' | 'createdBy' | 'parentReview'
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
      const reloaded = await this.repo.findOneByOrFail({ id: saved.id });

      return this.toModel(reloaded);
    });
  }

  async findById(id: number): Promise<CommentModel | null> {
    const entity = await this.run(() => this.repo.findOneBy({ id }));
    return entity ? this.toModel(entity) : null;
  }

  async findLikesByCommentId(commentId: number): Promise<UserModel[] | null> {
    return this.run(async () => {
      const exists = await this.repo.findOneBy({ id: commentId });
      if (!exists) return null;

      return this.repo
        .createQueryBuilder()
        .relation(CommentEntity, 'likedBy')
        .of(commentId)
        .loadMany<UserEntity>();
    });
  }

  async deleteById(id: number): Promise<void> {
    await this.run(() => this.repo.delete(id));
  }

  async findReplies(parentCommentId: number): Promise<CommentModel[]> {
    const entities = await this.run(() =>
      this.repo.findBy({ parentComment: { id: parentCommentId } }),
    );
    return entities.map((e) => this.toModel(e));
  }

  async addLike(commentId: number, userId: number): Promise<void> {
    await this.run(async () => {
      const alreadyLiked = await this.repo
        .createQueryBuilder('comment')
        .innerJoin('comment.likedBy', 'user', 'user.id = :userId', { userId })
        .where('comment.id = :commentId', { commentId })
        .getCount();
      if (alreadyLiked === 0) {
        await this.repo
          .createQueryBuilder()
          .relation(CommentEntity, 'likedBy')
          .of(commentId)
          .add(userId);
      }
    });
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
    const entities = await this.run(() =>
      this.repo.findBy({
        parentComment: IsNull(),
        ...(filters.createdById !== undefined && {
          createdBy: { id: filters.createdById },
        }),
        ...(filters.content !== undefined && {
          content: ILike(`%${filters.content}%`),
        }),
        ...(filters.parentReviewId !== undefined && {
          parentReview: { id: filters.parentReviewId },
        }),
      }),
    );
    return entities.map((e) => this.toModel(e));
  }

  private toModel(entity: CommentEntity): CommentModel {
    return {
      id: entity.id,
      content: entity.content,
      createdAt: entity.createdAt,
      createdBy: entity.createdBy,
      parentReview: ReviewModel.reconstitute({
        ...entity.parentReview,
        subjectRef: new SubjectReference(
          entity.parentReview.subjectType,
          entity.parentReview.subjectId,
        ),
      }),
      parentCommentId: entity.parentComment?.id ?? null,
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
