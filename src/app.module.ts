import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { BooksModule } from './books/books.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://tinht5667:0zp98Y7TaQ88jcBS@cluster0.sgcqdmm.mongodb.net'),

    BooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
