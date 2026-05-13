import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Bookmark extends Document {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  url: string;

  @Prop({ required: false, default: '' })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: false, default: null })
  categoryId: Types.ObjectId | null;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: false, default: false })
  isFavorite: boolean;
}

export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);

BookmarkSchema.index({ title: 'text', description: 'text', url: 'text', tags: 'text' });
