import { Inject, Injectable } from '@nestjs/common';
import { DataSource, ILike, Repository, QueryFailedError } from 'typeorm';
import { CommentEntity } from '../entity/comment.entity';
import { ICommentRepository } from '../repository/i-comment.repository';
import { AssociatedType } from '../model/comment.associated.type';
import { CommentModel } from '../model/comment.model';
import { CommentFilters } from '../model/comment.filter';
import { CommentDBException } from '../error/comment/comment-db.exception';
import { POSTGRES_DB } from '../infrastructure/database/provider/postgres.provider';

@Injectable()
export class CommentRepository implements ICommentRepository {
  private readonly repo: Repository<CommentEntity>;

  constructor(@Inject(POSTGRES_DB) ds: DataSource) {
    this.repo = ds.getRepository(CommentEntity);
  }

  async create(
    comment: Omit<CommentModel, 'id' | 'createdAt' | 'likedBy'>,
  ): Promise<CommentModel> {
    return this.run(() => this.repo.save(comment));
  }

  async findById(id: number): Promise<CommentModel | null> {
    return this.run(() => this.repo.findOneBy({ id }));
  }

  async deleteById(id: number): Promise<void> {
    await this.run(() => this.repo.delete(id));
  }

  async findByAssociatedId(
    associatedId: string,
    associatedType: AssociatedType,
  ): Promise<CommentModel[]> {
    return this.run(() =>
      this.repo.findBy({ associatedTo: associatedId, associatedType }),
    );
  }

  async addLike(commentId: number, userId: string): Promise<void> {
    const comment = await this.run(() =>
      this.repo.findOneBy({ id: commentId }),
    );
    if (comment && !comment.likedBy.includes(userId)) {
      comment.likedBy.push(userId);
      await this.run(() => this.repo.save(comment));
    }
  }

  async removeLike(commentId: number, userId: string): Promise<void> {
    const comment = await this.run(() =>
      this.repo.findOneBy({ id: commentId }),
    );
    if (comment) {
      comment.likedBy = comment.likedBy.filter((id) => id !== userId);
      await this.run(() => this.repo.save(comment));
    }
  }

  async search(filters: CommentFilters): Promise<CommentModel[]> {
    return this.run(() =>
      this.repo.findBy({
        ...(filters.createdBy !== undefined && {
          createdBy: filters.createdBy,
        }),
        ...(filters.content !== undefined && {
          content: ILike(`%${filters.content}%`),
        }),
        ...(filters.associatedType !== undefined && {
          associatedType: filters.associatedType,
        }),
      }),
    );
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
