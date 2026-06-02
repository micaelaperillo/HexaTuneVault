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
import type { ICreateReview } from '../port/review/create-review.port';
import type { IDeleteReview } from '../port/review/delete-review.port';
import type { ISearchReview } from '../port/review/search-review.port';
import type { IGetReview } from '../port/review/get-review.port';
import type { ILikeReview } from '../port/review/like-review.port';
import type { IUnlikeReview } from '../port/review/unlike-review.port';
import { CreateReviewRequest } from '../dto/create-review.request';
import { SearchReviewQueryDto } from '../dto/search-review-query.dto';
import { ReviewResponse } from '../dto/review-response.dto';
import { ReviewSearchCriteriaMapper } from './review-search-criteria.mapper';
import {
  CREATE_REVIEW,
  DELETE_REVIEW,
  SEARCH_REVIEW,
  GET_REVIEW,
  LIKE_REVIEW,
  UNLIKE_REVIEW,
} from '../port/review/tokens';

@Controller('api/reviews')
export class ReviewController {
  constructor(
    @Inject(CREATE_REVIEW) private readonly createReview: ICreateReview,
    @Inject(DELETE_REVIEW) private readonly deleteReview: IDeleteReview,
    @Inject(SEARCH_REVIEW) private readonly searchReview: ISearchReview,
    @Inject(GET_REVIEW) private readonly getReview: IGetReview,
    @Inject(LIKE_REVIEW) private readonly likeReview: ILikeReview,
    @Inject(UNLIKE_REVIEW) private readonly unlikeReview: IUnlikeReview,
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
    const response = ReviewResponse.fromDomain(review);
    res.header(
      'Location',
      `${req.protocol}://${req.get('host')}/api/reviews/${response.id}`,
    );
    return response;
  }

  @Get()
  async search(
    @Query() dto: SearchReviewQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ReviewResponse[]> {
    const criteria = ReviewSearchCriteriaMapper.fromDto(dto);
    const { data, total } = await this.searchReview.execute(criteria);
    res.header('X-Total-Count', total.toString());
    return data.map((review) => ReviewResponse.fromDomain(review));
  }

  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReviewResponse> {
    const review = await this.getReview.execute(id);
    return ReviewResponse.fromDomain(review);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // TODO: replace hardcoded userId with @CurrentUser() from AuthGuard
    const userId = '1';
    await this.deleteReview.execute({ reviewId: id, requesterId: userId });
  }

  @Put(':id/likes')
  @HttpCode(HttpStatus.NO_CONTENT)
  async like(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // TODO: replace hardcoded userId with @CurrentUser() from AuthGuard
    const userId = '1';
    await this.likeReview.execute(id, userId);
  }

  @Delete(':id/likes')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlike(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // TODO: replace hardcoded userId with @CurrentUser() from AuthGuard
    const userId = '1';
    await this.unlikeReview.execute(id, userId);
  }
}
