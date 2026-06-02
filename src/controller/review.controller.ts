import {
  Controller,
  Post,
  Get,
  Put,
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
import {
  CREATE_REVIEW,
  type ICreateReview,
} from '../port/review/create-review.port';
import {
  DELETE_REVIEW,
  type IDeleteReview,
} from '../port/review/delete-review.port';
import {
  SEARCH_REVIEW,
  type ISearchReview,
} from '../port/review/search-review.port';
import { GET_REVIEW, type IGetReview } from '../port/review/get-review.port';
import { LIKE_REVIEW, type ILikeReview } from '../port/review/like-review.port';
import {
  UNLIKE_REVIEW,
  type IUnlikeReview,
} from '../port/review/unlike-review.port';
import {
  COUNT_REVIEW_LIKES,
  type ICountReviewLikes,
} from '../port/review/count-review-likes.port';
import { CreateReviewRequest } from '../dto/create-review.request';
import { SearchReviewQueryDto } from '../dto/search-review-query.dto';
import { ReviewResponse } from '../dto/review-response.dto';
import { ReviewLikeCountResponse } from '../dto/review-like-count-response.dto';
import { ReviewSearchCriteria } from '../model/review-search-criteria';
import { ReviewModel, UserModel } from '../model';
import { plainToInstance } from 'class-transformer';
import { PageDto } from '../dto/page.dto';

@Controller('api/reviews')
export class ReviewController {
  constructor(
    @Inject(CREATE_REVIEW) private readonly createReview: ICreateReview,
    @Inject(DELETE_REVIEW) private readonly deleteReview: IDeleteReview,
    @Inject(SEARCH_REVIEW) private readonly searchReview: ISearchReview,
    @Inject(GET_REVIEW) private readonly getReview: IGetReview,
    @Inject(LIKE_REVIEW) private readonly likeReview: ILikeReview,
    @Inject(UNLIKE_REVIEW) private readonly unlikeReview: IUnlikeReview,
    @Inject(COUNT_REVIEW_LIKES)
    private readonly countReviewLikes: ICountReviewLikes,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateReviewRequest,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<ReviewResponse> {
    // TODO: replace hardcoded user with @CurrentUser() from AuthGuard
    const user = { id: 1 } as UserModel;
    const review = await this.createReview.create({
      content: dto.content,
      rating: dto.rating,
      subjectType: dto.subject_type,
      subjectId: dto.subject_id,
      author: user,
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
  ): Promise<PageDto<ReviewResponse>> {
    const criteria = ReviewSearchCriteriaMapper.fromDto(dto);
    const { items, total, ...page } = await this.searchReview.search(criteria);
    res.header('X-Total-Count', total.toString());
    return PageDto.of(items.map(ReviewController.toResponse), page, total);
  }

  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReviewResponse> {
    const review = await this.getReview.get(id);
    return ReviewController.toResponse(review);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // TODO: replace hardcoded user with @CurrentUser() from AuthGuard
    const user = { id: 1 } as UserModel;
    await this.deleteReview.delete({ reviewId: id, requesterId: user });
  }

  @Put(':id/likes')
  @HttpCode(HttpStatus.NO_CONTENT)
  async like(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // TODO: replace hardcoded userId with @CurrentUser() from AuthGuard
    const userId = '1';
    await this.likeReview.like(id, userId);
  }

  @Delete(':id/likes')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlike(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // TODO: replace hardcoded userId with @CurrentUser() from AuthGuard
    const userId = '1';
    await this.unlikeReview.unlike(id, userId);
  }

  @Get(':id/likes/count')
  async likeCount(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReviewLikeCountResponse> {
    const count = await this.countReviewLikes.count(id);
    return ReviewLikeCountResponse.fromCount(id, count);
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
        author: `/api/users/${review.author.id}`,
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
