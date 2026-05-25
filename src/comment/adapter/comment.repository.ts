import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { CommentEntity } from '../entity/comment.entity';
import { ICommentRepository } from '../repository/i-comment.repository';
import { AssociatedType } from '../model/associated-type.enum';
import { CommentModel } from '../model/comment.model';
import { CommentFilters } from '../model/comment-filters.model';

@Injectable()
export class CommentRepository implements ICommentRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private repo: Repository<CommentEntity>,
  ) {}

  async create(
    comment: Omit<CommentModel, 'id' | 'createdAt' | 'likedBy'>,
  ): Promise<CommentModel> {
    return this.repo.save(comment);
  }

  async findById(id: number): Promise<CommentModel | null> {
    return this.repo.findOneBy({ id });
  }

  async deleteById(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async findByAssociatedId(
    associatedId: number,
    associatedType: AssociatedType,
  ): Promise<CommentModel[]> {
    return this.repo.findBy({ associatedTo: associatedId, associatedType });
  }

  async addLike(commentId: number, userId: number): Promise<void> {
    const comment = await this.repo.findOneBy({ id: commentId });
    if (comment && !comment.likedBy.includes(userId)) {
      comment.likedBy.push(userId);
      await this.repo.save(comment);
    }
  }

  async removeLike(commentId: number, userId: number): Promise<void> {
    const comment = await this.repo.findOneBy({ id: commentId });
    if (comment) {
      comment.likedBy = comment.likedBy.filter((id) => id !== userId);
      await this.repo.save(comment);
    }
  }

  async search(filters: CommentFilters): Promise<CommentModel[]> {
    const qb = this.repo.createQueryBuilder('comment');

    if (filters.createdBy !== undefined)
      qb.andWhere('comment.createdBy = :createdBy', {
        createdBy: filters.createdBy,
      });
    if (filters.content !== undefined)
      qb.andWhere('comment.content ILIKE :content', {
        content: `%${filters.content}%`,
      });
    if (filters.associatedType !== undefined)
      qb.andWhere('comment.associatedType = :associatedType', {
        associatedType: filters.associatedType,
      });

    return qb.getMany();
  }
}
