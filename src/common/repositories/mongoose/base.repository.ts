import {
  QueryFilter,
  Model,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  UpdateWriteOpResult,
  Types,
} from 'mongoose';

export abstract class BaseRepository<T> {
  constructor(private model: Model<T>) {}
  async create(doc: Partial<T>): Promise<T> {
    return this.model.create(doc);
  }

  async findDocuments(
    filter?: QueryFilter<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T[] | []> {
    return this.model.find(filter, projection, options).lean() as Promise<T[]>;
  }
  async findOneDocument(
    filter: QueryFilter<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    return this.model.findOne(filter, projection, options);
  }
  async findOneDocumentAndUpdate(
    filter: QueryFilter<T>,
    payload: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, payload, {
      new: true,
      ...options,
    });
  }
  async findByIdDocument(
    id: Types.ObjectId | string,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    return this.model.findById(id, projection, options);
  }
  async findByIdAndDeleteDocument(
    id: Types.ObjectId | string,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    return this.model.findByIdAndDelete(id, options);
  }
  async findAndUpdateDocument(
    id: Types.ObjectId | string,
    payload: UpdateQuery<T>,
  ): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, payload, { new: true });
  }
  async deleteDocument(
    filter: QueryFilter<T>,
    options?: QueryOptions<T>,
  ): Promise<{ deletedCount?: number }> {
    return this.model.deleteOne(filter, options as any);
  }
  async updateDocument(
    filter: QueryFilter<T>,
    payload: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<UpdateWriteOpResult> {
    return await this.model.updateOne(filter, payload, options as any);
  }
  async updateManyDocuments(
    filter: QueryFilter<T>,
    payload: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<UpdateWriteOpResult> {
    return await this.model.updateMany(filter, payload, options as any);
  }
  async deleteManyDocuments(
    filter: QueryFilter<T>,
    options?: QueryOptions<T>,
  ): Promise<{ deletedCount?: number }> {
    return this.model.deleteMany(filter, options as any);
  }
  async countDocuments(
    filter: QueryFilter<T>,
    options?: QueryOptions<T>,
  ): Promise<number> {
    return this.model.countDocuments(filter, options as any);
  }
}
