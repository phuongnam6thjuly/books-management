import mongoose, { HydratedDocument } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Author } from 'src/modules/authors/schema/author.schema';

export type BookDocument = HydratedDocument<Book>;

@Schema({
  collection: 'books',
  timestamps: true,
})
export class Book {
  @Prop({ type: String, unique: true, required: true })
  code: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  publisher: string;

  @Prop({ type: Number, required: true })
  year: number;

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: String, required: true })
  site: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Author.name,
    required: true,
  })
  authorId: mongoose.Types.ObjectId;
}

export const BookSchema = SchemaFactory.createForClass(Book);
