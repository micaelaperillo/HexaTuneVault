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
  DELETE_REVIEW,
  type IDeleteReview,
  SEARCH_REVIEW,
  type ISearchReview,
  GET_REVIEW,
  type IGetReview,
  LIKE_REVIEW,
  type ILikeReview,
  UNLIKE_REVIEW,
  type IUnlikeReview,
  COUNT_REVIEW_LIKES,
  type ICountReviewLikes,
  HAS_LIKED_REVIEW,
  type IHasLikedReview,
} from '../../../port/in';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewFilterDto } from './dto/review-filter.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewLikeCountResponse } from './dto/review-like-count-response.dto';
import { LikedResponseDto } from './dto/liked-response.dto';
import type { ReviewFilters } from '../../../model/review-filter.model';
import type { ReviewModel } from '../../../model';
import { splitSubject } from '../../../model/review-subject';
import { plainToInstance } from 'class-transformer';
import { Public } from './decorator/public.decorator';
import { CurrentUser } from './decorator/current-user.decorator';
import type { AuthenticatedUser } from './auth/authenticated-user';
import { PageDto } from './dto/page.dto';

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
    @Inject(HAS_LIKED_REVIEW)
    private readonly hasLikedReview: IHasLikedReview,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<ReviewResponseDto> {
    const review = await this.createReview.create({
      content: dto.content,
      rating: dto.rating,
      subject: dto.subject,
      author: user,
    });

    res.header(
      'Location',
      `${req.protocol}://${req.get('host')}/api/reviews/${review.id}`,
    );

    return ReviewController.toResponse(review);
  }

  @Public()
  @Get()
  async search(
    @Query() dto: ReviewFilterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PageDto<ReviewResponseDto>> {
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
    const filters: ReviewFilters =
      dto.subject_type !== undefined
        ? { ...base, subjectType: dto.subject_type, subjectId: dto.subject_id }
        : { ...base, subjectType: undefined, subjectId: undefined };
    const { items, total, ...page } = await this.searchReview.search(filters);
    res.header('X-Total-Count', total.toString());
    return PageDto.of(items.map(ReviewController.toResponse), page, total);
  }

  @Public()
  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReviewResponseDto> {
    const review = await this.getReview.get(id);
    return ReviewController.toResponse(review);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.deleteReview.delete({ reviewId: id, requesterId: user });
  }

  @Put(':id/likes')
  @HttpCode(HttpStatus.NO_CONTENT)
  async like(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.likeReview.like(id, user.id);
  }

  @Delete(':id/likes')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlike(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.unlikeReview.unlike(id, user.id);
  }

  @Public()
  @Get(':id/likes/count')
  async likeCount(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReviewLikeCountResponse> {
    const count = await this.countReviewLikes.count(id);
    return plainToInstance(ReviewLikeCountResponse, { review_id: id, count });
  }

  @Get(':id/likes/me')
  async hasLiked(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<LikedResponseDto> {
    const liked = await this.hasLikedReview.hasLiked(id, user.id);
    return plainToInstance(LikedResponseDto, { liked });
  }

  private static toResponse(this: void, review: ReviewModel) {
    const { type, id } = splitSubject(review.subject);

    return plainToInstance(
      ReviewResponseDto,
      {
        ...review,
        created_at: review.createdAt,
        updated_at: review.updatedAt,
        self: `/api/reviews/${review.id}`,
        collection: `/api/reviews`,
        subject: `/api/${type}s/${id}`,
        author: `/api/users/${review.author.id}`,
      },
      { excludeExtraneousValues: true },
    );
  }
}
