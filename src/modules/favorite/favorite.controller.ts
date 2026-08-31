import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Auth, AuthUser } from 'src/common/decorator';
import { Sys_Role } from 'src/common/enums';
import { FavoriteServices } from './favorite.service';
import type { IUser } from 'src/common/interfaces';

@ApiTags('Favorites')
@ApiBearerAuth('access-token')
@Auth(Sys_Role.Admin, Sys_Role.User, Sys_Role.SuperAdmin)
@Controller('favorites')
export class Favorite_Controller {
  constructor(private readonly favoriteServices: FavoriteServices) {}

  @HttpCode(200)
  @Get()
  @ApiOperation({ summary: 'Get current user favorites' })
  @ApiResponse({ status: 200, description: 'Return list of favorites' })
  getFavorites(@AuthUser() user: IUser) {
    return this.favoriteServices.getFavorites(user);
  }

  @Post('/:hotelId')
  @ApiOperation({ summary: 'Add a hotel to favorites' })
  @ApiResponse({ status: 201, description: 'Favorite added successfully' })
  addFavorite(
    @Param('hotelId', ParseIntPipe) hotelId: number,
    @AuthUser() user: IUser,
  ) {
    return this.favoriteServices.addFavorite(hotelId, user);
  }

  @Delete('/:hotelId')
  @ApiOperation({ summary: 'Remove a hotel from favorites' })
  @ApiResponse({ status: 200, description: 'Favorite removed successfully' })
  removeFavorite(
    @Param('hotelId', ParseIntPipe) hotelId: number,
    @AuthUser() user: IUser,
  ) {
    return this.favoriteServices.removeFavorite(hotelId, user);
  }
}
