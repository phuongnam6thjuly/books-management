import { HydratedDocument } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { EStudentUniversity } from '../enums/student-university.enum';

export type StudentDocument = HydratedDocument<Student>;

@Schema({
  collection: 'students',
  timestamps: true,
})
export class Student {
  @Prop({ type: String, unique: true, required: true })
  code: string;

  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({
    type: String,
    enum: Object.values(EStudentUniversity),
    required: true,
  })
  university: EStudentUniversity;

  @Prop({ type: String, required: true })
  major: string;

  @Prop({ type: Number, required: true })
  borrowCount: number;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
