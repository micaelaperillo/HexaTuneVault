import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import type { ICreateReview } from '../port/review/create-review.port';
import type { IDeleteReview } from '../port/review/delete-review.port';
import type { ISearchReview } from '../port/review/search-review.port';
import type { IGetReview } from '../port/review/get-review.port';
import { CreateReviewRequest } from '../dto/create-review.request';
import { SearchReviewQueryDto } from '../dto/search-review-query.dto';
import { ReviewResponse } from '../dto/review-response.dto';
import {
  CREATE_REVIEW,
  DELETE_REVIEW,
  SEARCH_REVIEW,
  GET_REVIEW,
} from '../port/review/tokens';
import { ReviewSearchCriteria } from '../model/review-search-criteria';
import { ReviewModel } from '../model';
import { plainToInstance } from 'class-transformer';

@Controller('api/reviews')
export class ReviewController {
  constructor(
    @Inject(CREATE_REVIEW) private readonly createReview: ICreateReview,
    @Inject(DELETE_REVIEW) private readonly deleteReview: IDeleteReview,
    @Inject(SEARCH_REVIEW) private readonly searchReview: ISearchReview,
    @Inject(GET_REVIEW) private readonly getReview: IGetReview,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateReviewRequest,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<ReviewResponse> {
    // TODO: replace hardcoded userId with @CurrentUser() from AuthGuard
    const userId = '1';
    const review = await this.createReview.execute({
      content: dto.content,
      rating: dto.rating,
      subjectType: dto.subject_type,
      subjectId: dto.subject_id,
      authorId: userId,
    });

    res.header(
      'Location',
      `${req.protocol}://${req.get('host')}/api/reviews/${review.id}`,
    );

    return ReviewController.toResponse(review);
  }

  @Get()
  async search(
    @Query() dto: SearchReviewQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ReviewResponse[]> {
    const criteria = ReviewSearchCriteriaMapper.fromDto(dto);
    const { data, total } = await this.searchReview.execute(criteria);
    res.header('X-Total-Count', total.toString());
    return data.map(ReviewController.toResponse);
  }

  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReviewResponse> {
    const review = await this.getReview.execute(id);
    return ReviewController.toResponse(review);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // TODO: replace hardcoded userId with @CurrentUser() from AuthGuard
    const userId = '1';
    await this.deleteReview.execute({ reviewId: id, requesterId: userId });
  }

  private static toResponse(this: void, review: ReviewModel) {
    if (review.id === undefined || review.createdAt === undefined) {
      throw new Error('Cannot create response from unsaved review');
    }

    return plainToInstance(
      ReviewResponse,
      {
        ...review,
        created_at: review.createdAt,
        updated_at: review.updatedAt,
        self: `/api/reviews/${review.id}`,
        collection: `/api/reviews`,
        subject: `/api/${review.subjectRef.type}s/${review.subjectRef.id}`,
        author: `/api/users/${review.authorId}`,
      },
      { excludeExtraneousValues: true },
    );
  }
}

class ReviewSearchCriteriaMapper {
  static fromDto(dto: SearchReviewQueryDto): ReviewSearchCriteria {
    const base = {
      page: dto.page,
      pageSize: dto.page_size,
      content: dto.content_contains,
      authorId: dto.author_id,
      minRating: dto.min_rating,
      maxRating: dto.max_rating,
      dateFrom: dto.date_from,
      dateTo: dto.date_to,
      sortBy: dto.sort_by,
      sortOrder: dto.sort_order,
    };

    if (dto.subject_type !== undefined) {
      return {
        ...base,
        subjectType: dto.subject_type,
        subjectId: dto.subject_id,
      };
    }
    return { ...base, subjectType: undefined, subjectId: undefined };
  }
}
