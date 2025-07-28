import { HydratedDocument } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type AuthorDocument = HydratedDocument<Author>;

@Schema({
  collection: 'authors',
  timestamps: true,
})
export class Author {
  @Prop({ type: String, unique: true, required: true })
  code: string;

  @Prop({ type: String, required: true })
  fullName: string;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);
