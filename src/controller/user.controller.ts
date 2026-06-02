import type { UserModel } from '../model';

import {
  Controller,
  Inject,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CurrentUser } from '../infrastructure/auth/current-user.decorator';
import type { AuthenticatedUser } from '../model/authenticated-user';
import { ForbiddenUserActionException } from '../error/user/';

import {
  AUTHENTICATE_USER,
  type IAuthenticateUser,
  CREATE_USER,
  type ICreateUser,
  EDIT_USER,
  type IEditUser,
  DELETE_USER,
  type IDeleteUser,
  SEARCH_USER,
  type ISearchUser,
  GET_USER,
  type IGetUser,
  FOLLOW_USER,
  type IFollowUser,
  LIST_FOLLOWS,
  type IListFollows,
} from '../port/user/';

import { CreateUserDto } from '../dto/create-user.dto';
import { EditUserDto } from '../dto/edit-user.dto';
import { UserFiltersDto } from '../dto/user-filters.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { PageDto } from '../dto/page.dto';
import { PageQueryDto } from '../dto/page-query.dto';
import { Public } from '../infrastructure/auth/public.decorator';

@Controller('api/users')
export class UserController {
  constructor(
    @Inject(AUTHENTICATE_USER)
    private readonly authenticateUser: IAuthenticateUser,
    @Inject(CREATE_USER) private readonly createUser: ICreateUser,
    @Inject(EDIT_USER) private readonly editUser: IEditUser,
    @Inject(DELETE_USER) private readonly deleteUser: IDeleteUser,
    @Inject(SEARCH_USER) private readonly searchUser: ISearchUser,
    @Inject(GET_USER) private readonly getUser: IGetUser,
    @Inject(FOLLOW_USER) private readonly followUser: IFollowUser,
    @Inject(LIST_FOLLOWS) private readonly listFollows: IListFollows,
  ) {}

  @Public()
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.createUser.create(dto);
    return UserController.toResponse(user);
  }

  @Public()
  @Get()
  async search(@Query() filters: UserFiltersDto): Promise<UserResponseDto[]> {
    const users = await this.searchUser.search(filters);
    return users.map(UserController.toResponse);
  }

  @Public()
  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    const user = await this.getUser.get(id);
    return UserController.toResponse(user);
  }

  @Patch(':id')
  async edit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditUserDto,
    @CurrentUser() current: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    if (id !== current.id) {
      throw new ForbiddenUserActionException();
    }
    const user = await this.editUser.edit({ ...dto, id });
    return UserController.toResponse(user);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() current: AuthenticatedUser,
  ): Promise<void> {
    if (id !== current.id) {
      throw new ForbiddenUserActionException();
    }
    await this.deleteUser.deleteById(id);
  }

  @Public()
  @Get(':id/followers')
  async followers(
    @Param('id', ParseIntPipe) id: number,
    @Query() page: PageQueryDto,
  ): Promise<PageDto<UserResponseDto>> {
    const result = await this.listFollows.findFollowers(id, page);
    return PageDto.of(
      result.items.map(UserController.toResponse),
      page,
      result.total,
    );
  }

  @Public()
  @Get(':id/following')
  async following(
    @Param('id', ParseIntPipe) id: number,
    @Query() page: PageQueryDto,
  ): Promise<PageDto<UserResponseDto>> {
    const result = await this.listFollows.findFollowing(id, page);
    return PageDto.of(
      result.items.map(UserController.toResponse),
      page,
      result.total,
    );
  }

  @Put(':id/followers')
  @HttpCode(204)
  async follow(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() current: AuthenticatedUser,
  ): Promise<void> {
    await this.followUser.follow(current.id, id);
  }

  @Delete(':id/followers')
  @HttpCode(204)
  async unfollow(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() current: AuthenticatedUser,
  ): Promise<void> {
    await this.followUser.unfollow(current.id, id);
  }

  private static toResponse(this: void, user: UserModel) {
    return plainToInstance(
      UserResponseDto,
      {
        ...user,
        location: user.location ?? '',
        followerCount: user.followerCount ?? 0,
        followingCount: user.followingCount ?? 0,
        self: `/api/users/${user.id}`,
      },
      { excludeExtraneousValues: true },
    );
  }
}
