import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, TypeORMError } from 'typeorm';
import { MapErrors } from 'error-mapper-decorator';
import { CommentEntity } from '../entity/comment.entity';
import { CommentLikeEntity } from '../entity/comment-like.entity';
import { ICommentRepository } from '../repository/comment-repository.port';
import type { CommentModel } from '../model/comment.model';
import type { CommentFilters } from '../model/comment.filter';
import type { ReviewModel, UserModel } from '../model';
import type { Page } from '../model';
import { buildSubject } from '../model/review-subject';
import { escapeLike } from './like-escape';
import { CommentDBException } from '../error/comment/comment-db.exception';

@Injectable()
@MapErrors(
  { exclude: ['toModel'] },
  {
    from: TypeORMError,
    to: (error) => new CommentDBException(error.message),
  },
)
export class CommentRepository implements ICommentRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly repo: Repository<CommentEntity>,
    @InjectRepository(CommentLikeEntity)
    private readonly likeRepo: Repository<CommentLikeEntity>,
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
    await this.attachLikeCounts([reloaded]);
    return this.toModel(reloaded);
  }

  async findById(id: number): Promise<CommentModel | null> {
    const entity = await this.baseQuery()
      .where('comment.id = :id', { id })
      .getOne();
    if (!entity) {
      return null;
    }
    await this.attachLikeCounts([entity]);
    return this.toModel(entity);
  }

  async deleteById(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async findReplies(parentCommentId: number): Promise<CommentModel[]> {
    const entities = await this.baseQuery()
      .where('comment.parentComment = :parentCommentId', { parentCommentId })
      .getMany();
    await this.attachLikeCounts(entities);
    return entities.map((e) => this.toModel(e));
  }

  async hasLike(commentId: number, userId: number): Promise<boolean> {
    return (await this.likeRepo.count({ where: { commentId, userId } })) > 0;
  }

  async addLike(commentId: number, userId: number): Promise<void> {
    // Idempotent: a duplicate (PK) like is silently ignored.
    await this.likeRepo
      .createQueryBuilder()
      .insert()
      .values({ commentId, userId })
      .orIgnore()
      .execute();
  }

  async removeLike(commentId: number, userId: number): Promise<void> {
    await this.likeRepo.delete({ commentId, userId });
  }

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
    await this.attachLikeCounts(entities);
    return {
      items: entities.map((e) => this.toModel(e)),
      page,
      pageSize,
      total,
    };
  }

  private baseQuery(): SelectQueryBuilder<CommentEntity> {
    return this.repo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.createdBy', 'createdBy')
      .leftJoinAndSelect('comment.parentReview', 'parentReview')
      .leftJoinAndSelect('parentReview.author', 'parentReviewAuthor')
      .leftJoinAndSelect('comment.parentComment', 'parentComment');
  }

  // Populates `likeCount` for the given comments with a single grouped count
  // query, avoiding both an N+1 per comment and loading every liker row.
  private async attachLikeCounts(comments: CommentEntity[]): Promise<void> {
    if (comments.length === 0) {
      return;
    }
    const ids = comments.map((c) => c.id);
    const rows = await this.likeRepo
      .createQueryBuilder('cl')
      .select('cl.commentId', 'commentId')
      .addSelect('COUNT(*)', 'count')
      .where('cl.commentId IN (:...ids)', { ids })
      .groupBy('cl.commentId')
      .getRawMany<{ commentId: number; count: string }>();
    const counts = new Map<number, number>(
      rows.map((r) => [Number(r.commentId), Number(r.count)]),
    );
    for (const comment of comments) {
      comment.likeCount = counts.get(comment.id) ?? 0;
    }
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
      likes: entity.likeCount,
    };
  }
}
