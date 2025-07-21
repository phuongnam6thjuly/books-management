import mongoose, { Model } from "mongoose";

import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";

import { Book, BookSchema } from "./schema/book.schema";
import { CreateBookBodyDto } from "./dto/create-book.dto";

@Injectable()
export class BooksService {
    private connections = new Map<string, mongoose.Connection>();

    async getConnection(dbName: string) {
        if (this.connections.has(dbName)) {
            return this.connections.get(dbName);
        }

        const uri = `mongodb+srv://tinht5667:0zp98Y7TaQ88jcBS@cluster0.sgcqdmm.mongodb.net/${dbName}?retryWrites=true&w=majority`;
        const conn = await mongoose.createConnection(uri).asPromise();

        conn.model(Book.name, BookSchema);

        this.connections.set(dbName, conn);

        return conn;
    }

    async getBookModel(dbName: string) {
        const conn = await this.getConnection(dbName);
        if (!conn) {
            throw new InternalServerErrorException();
        }

        return conn.model<Book>(Book.name);
    }

    async create({ dbName, doc }: { dbName: string, doc: Book }) {
        const BookModel = await this.getBookModel(dbName);

        const book = new BookModel(doc);
        return await book.save();
    }

    // POST /v1/books/create
    async createBook(body: CreateBookBodyDto) {
        const { name } = body;

        const dbName = name.startsWith("a") ? "acer-phat" : "dell-tin";

        return await this.create({ dbName, doc: { name } });
    }
}