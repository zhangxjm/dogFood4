import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto, UpdateBookmarkDto, SearchBookmarkDto } from './bookmark.dto';
import { Bookmark } from './bookmark.schema';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  async findAll(@Query() searchDto: SearchBookmarkDto): Promise<Bookmark[]> {
    return this.bookmarksService.findAll(searchDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Bookmark> {
    return this.bookmarksService.findOne(id);
  }

  @Post()
  async create(@Body() createBookmarkDto: CreateBookmarkDto): Promise<Bookmark> {
    return this.bookmarksService.create(createBookmarkDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBookmarkDto: UpdateBookmarkDto,
  ): Promise<Bookmark> {
    return this.bookmarksService.update(id, updateBookmarkDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.bookmarksService.remove(id);
  }

  @Patch(':id/toggle-favorite')
  async toggleFavorite(@Param('id') id: string): Promise<Bookmark> {
    return this.bookmarksService.toggleFavorite(id);
  }
}
