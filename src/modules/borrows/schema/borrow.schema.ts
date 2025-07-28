import { HydratedDocument } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BorrowDocument = HydratedDocument<Borrow>;

@Schema({
  collection: 'borrows',
  timestamps: true,
})
export class Borrow {
  @Prop({ type: String, required: true })
  bookCode: string;

  @Prop({ type: String, required: true })
  studentCode: string;

  @Prop({ type: Date, required: true })
  borrowDate: Date;

  @Prop({ type: Date, required: true })
  returnDate: Date;
}

export const BorrowSchema = SchemaFactory.createForClass(Borrow);
