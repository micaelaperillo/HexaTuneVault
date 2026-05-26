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
  ParseIntPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ICreateReview } from '@review/port/in/create-review.port.js';
import type { IDeleteReview } from '@review/port/in/delete-review.port.js';
import type { ISearchReview } from '@review/port/in/search-review.port.js';
import type { IGetReview } from '@review/port/in/get-review.port.js';
import { CreateReviewRequest } from './dto/create-review.request.js';
import { SearchReviewQueryDto } from './dto/search-review-query.dto.js';
import { ReviewResponse } from './dto/review-response.dto.js';
import { SearchCriteriaMapper } from './mapper/search-criteria.mapper.js';
import {
  CREATE_REVIEW,
  DELETE_REVIEW,
  SEARCH_REVIEW,
  GET_REVIEW,
} from '@review/port/tokens.js';

@Controller('reviews')
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
  ): Promise<ReviewResponse> {
    // TODO: replace hardcoded userId with @CurrentUser() from AuthGuard
    const userId = 1;
    const result = await this.createReview.execute({
      content: dto.content,
      rating: dto.rating,
      subjectType: dto.subject_type,
      subjectId: dto.subject_id,
      authorId: userId,
    });
    res.header('Location', `/reviews/${result.id}`);
    return ReviewResponse.fromDomain(result);
  }

  @Get()
  async search(
    @Query() dto: SearchReviewQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ReviewResponse[]> {
    const criteria = SearchCriteriaMapper.fromDto(dto);
    const { data, total } = await this.searchReview.execute(criteria);
    res.header('X-Total-Count', total.toString());
    return data.map((r) => ReviewResponse.fromDomain(r.review, r.subject));
  }

  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReviewResponse> {
    const { review, subject } = await this.getReview.execute(id);
    return ReviewResponse.fromDomain(review, subject);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // TODO: replace hardcoded userId with @CurrentUser() from AuthGuard
    const userId = 1;
    await this.deleteReview.execute({ reviewId: id, requesterId: userId });
  }
}
