import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { BooksModule } from './modules/books/books.module';
import { AuthorsModule } from './modules/authors/authors.module';
import { StudentsModule } from './modules/students/students.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { BorrowsModule } from './modules/borrows/borrows.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://tinht5667:0zp98Y7TaQ88jcBS@cluster0.sgcqdmm.mongodb.net',
    ),

    BooksModule,
    AuthorsModule,
    BorrowsModule,
    StudentsModule,
    EmployeesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
