import {
  Controller,
  Inject,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';

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
import { LoginUserDto } from '../dto/login-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { UserLinkDto } from '../dto/user-link.dto';
import { PageDto } from '../dto/page.dto';
import { PageQueryDto } from '../dto/page-query.dto';

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

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.createUser.create(dto);
    return UserResponseDto.from(user);
  }

  @Post('authenticate')
  async authenticate(@Body() dto: LoginUserDto): Promise<AuthResponseDto> {
    const token = await this.authenticateUser.authenticate(dto);
    return AuthResponseDto.from(token);
  }

  @Get()
  async search(@Query() filters: UserFiltersDto): Promise<UserResponseDto[]> {
    const users = await this.searchUser.search(filters);
    return UserResponseDto.fromMany(users);
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    const user = await this.getUser.get(id);
    return UserResponseDto.from(user);
  }

  @Patch(':id')
  async edit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.editUser.edit({ ...dto, id });
    return UserResponseDto.from(user);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteUser.deleteById(id);
  }

  @Get(':id/followers')
  async followers(
    @Param('id', ParseIntPipe) id: number,
    @Query() page: PageQueryDto,
  ): Promise<PageDto<UserLinkDto>> {
    const result = await this.listFollows.findFollowers(id, page);
    return PageDto.of(
      UserLinkDto.fromMany(result.items.map(String)),
      page,
      result.total,
    );
  }

  @Get(':id/following')
  async following(
    @Param('id', ParseIntPipe) id: number,
    @Query() page: PageQueryDto,
  ): Promise<PageDto<UserLinkDto>> {
    const result = await this.listFollows.findFollowing(id, page);
    return PageDto.of(
      UserLinkDto.fromMany(result.items.map(String)),
      page,
      result.total,
    );
  }

  @Patch(':id/follow')
  async follow(
    @Param('id', ParseIntPipe) id: number,
    @Body('follower_id', ParseIntPipe) followerId: number,
  ): Promise<void> {
    await this.followUser.follow(followerId, id);
  }

  @Patch(':id/unfollow')
  async unfollow(
    @Param('id', ParseIntPipe) id: number,
    @Body('follower_id', ParseIntPipe) followerId: number,
  ): Promise<void> {
    await this.followUser.unfollow(followerId, id);
  }
}
