import { HydratedDocument } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type EmployeeDocument = HydratedDocument<Employee>;

@Schema({
  collection: 'employees',
  timestamps: true,
})
export class Employee {
  @Prop({ type: String, unique: true, required: true })
  code: string;

  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: String, required: true })
  lib: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
