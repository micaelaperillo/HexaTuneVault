import { Injectable, Inject } from '@nestjs/common';
import type {
  ICreateReview,
  CreateReviewCommand,
} from '@review/port/in/create-review.port.js';
import type { IReviewRepository } from '@review/port/out/review-repository.port.js';
import type { ISubjectResolver } from '@review/port/out/subject-resolver.port.js';
import { ReviewModel } from '@review/domain/model/review.model.js';
import { SubjectReference } from '@review/domain/model/subject-reference.js';
import { DuplicateReviewException } from '@review/domain/exception/duplicate-review.exception.js';
import { REVIEW_REPOSITORY, SUBJECT_RESOLVER } from '@review/port/tokens.js';

@Injectable()
export class CreateReviewService implements ICreateReview {
  constructor(
    @Inject(REVIEW_REPOSITORY) private readonly repo: IReviewRepository,
    @Inject(SUBJECT_RESOLVER) private readonly resolver: ISubjectResolver,
  ) {}

  async execute(cmd: CreateReviewCommand): Promise<ReviewModel> {
    const subjectRef = new SubjectReference(cmd.subjectType, cmd.subjectId);

    const model = ReviewModel.create({
      subjectRef,
      content: cmd.content,
      rating: cmd.rating,
      authorId: cmd.authorId,
    });

    const existing = await this.repo.findByAuthorAndSubject(
      cmd.authorId,
      subjectRef,
    );
    if (existing !== null) {
      throw new DuplicateReviewException();
    }

    await this.resolver.resolve(subjectRef);

    return this.repo.save(model);
  }
}
