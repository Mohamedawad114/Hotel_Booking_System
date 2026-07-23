import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export abstract class BaseRepository<
  Model extends ModelDelegate,
  CreateDto,
  UpdateDto,
> {
  constructor(
    protected readonly model: Model,
    protected readonly prisma: PrismaService,
  ) {}
  async findById(id: number, options?: any) {
    return await this.model.findUnique({ where: { id }, ...options });
  }
  async findOne(filter: any, options?: any) {
    return await this.model.findFirst({ where: filter, ...options });
  }
  async findMany(filter: any, options?: any) {
    return await this.model.findMany({ where: filter, ...options });
  }
  async findUnique(filter: any, options?: any) {
    return await this.model.findUnique({ where: filter, ...options });
  }
  async updateOne(filter: any, data: UpdateDto, options?: any) {
    return await this.model.update({ where: filter, data, ...options });
  }
  async updateMany(filter: any, data: UpdateDto) {
    return await this.model.updateMany({ where: filter, data });
  }
  async upsert(data: UpdateDto | CreateDto, filter?: any) {
    return await this.model.upsert({
      where: filter,
      update: data,
      create: data,
    });
  }
  async create(data: CreateDto) {
    return await this.model.create({ data });
  }
  async createMany(data: CreateDto[], option?: any) {
    return await this.model.createMany({ data, ...option });
  }
  async delete(filter: any) {
    return await this.model.delete({ where: filter });
  }
  async deleteMany(filter?: any) {
    return await this.model.deleteMany({ where: filter });
  }
  async count(filter?: any) {
    return await this.model.count({ where: filter });
  }

  async transaction<T>(
    callback: (tx: PrismaService) => Promise<T>,
    options?: { timeout?: number; maxWait?: number },
  ): Promise<T> {
    return this.prisma.$transaction(
      async (tx) => {
        return await callback(tx as any);
      },
      {
        timeout: options?.timeout ?? 60000,
        maxWait: options?.maxWait ?? 10000,
      },
    );
  }
}

type ModelDelegate = {
  findMany(args?: any): any;
  findUnique(args: any): any;
  findFirst(args: any): any;
  create(args: any): any;
  createMany(args: any): any;
  update(args: any): any;
  upsert(args: any): any;
  updateMany(args: any): any;
  delete(args: any): any;
  deleteMany(args?: any): any;
  count(args?: any): any;
};
