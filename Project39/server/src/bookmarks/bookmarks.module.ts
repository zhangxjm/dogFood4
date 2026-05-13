import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { Bookmark, BookmarkSchema } from './bookmark.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bookmark.name, schema: BookmarkSchema }]),
  ],
  controllers: [BookmarksController],
  providers: [BookmarksService],
})
export class BookmarksModule {}
