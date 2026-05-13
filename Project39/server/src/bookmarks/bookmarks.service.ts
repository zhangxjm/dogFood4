import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bookmark } from './bookmark.schema';
import { CreateBookmarkDto, UpdateBookmarkDto, SearchBookmarkDto } from './bookmark.dto';

@Injectable()
export class BookmarksService {
  constructor(@InjectModel(Bookmark.name) private bookmarkModel: Model<Bookmark>) {}

  async findAll(searchDto: SearchBookmarkDto): Promise<Bookmark[]> {
    const query: any = {};

    if (searchDto.keyword) {
      query.$text = { $search: searchDto.keyword };
    }

    if (searchDto.categoryId) {
      if (searchDto.categoryId === 'null') {
        query.categoryId = null;
      } else {
        query.categoryId = new Types.ObjectId(searchDto.categoryId);
      }
    }

    if (searchDto.isFavorite !== undefined) {
      query.isFavorite = searchDto.isFavorite;
    }

    return this.bookmarkModel
      .find(query)
      .populate('categoryId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Bookmark> {
    const bookmark = await this.bookmarkModel
      .findById(id)
      .populate('categoryId')
      .exec();
    
    if (!bookmark) {
      throw new NotFoundException(`Bookmark with ID ${id} not found`);
    }
    return bookmark;
  }

  async create(createBookmarkDto: CreateBookmarkDto): Promise<Bookmark> {
    const data: any = { ...createBookmarkDto };
    if (createBookmarkDto.categoryId) {
      data.categoryId = new Types.ObjectId(createBookmarkDto.categoryId);
    }

    const createdBookmark = new this.bookmarkModel(data);
    const saved = await createdBookmark.save();
    return saved.populate('categoryId');
  }

  async update(id: string, updateBookmarkDto: UpdateBookmarkDto): Promise<Bookmark> {
    const data: any = { ...updateBookmarkDto };
    if (updateBookmarkDto.categoryId) {
      data.categoryId = new Types.ObjectId(updateBookmarkDto.categoryId);
    }

    const updatedBookmark = await this.bookmarkModel
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('categoryId')
      .exec();
    
    if (!updatedBookmark) {
      throw new NotFoundException(`Bookmark with ID ${id} not found`);
    }
    return updatedBookmark;
  }

  async remove(id: string): Promise<void> {
    const result = await this.bookmarkModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Bookmark with ID ${id} not found`);
    }
  }

  async toggleFavorite(id: string): Promise<Bookmark> {
    const bookmark = await this.bookmarkModel.findById(id).exec();
    if (!bookmark) {
      throw new NotFoundException(`Bookmark with ID ${id} not found`);
    }
    bookmark.isFavorite = !bookmark.isFavorite;
    const saved = await bookmark.save();
    return saved.populate('categoryId');
  }
}
