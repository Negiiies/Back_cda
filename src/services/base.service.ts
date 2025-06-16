// src/services/base.service.ts
import { Model, ModelStatic } from 'sequelize';
import { AppError } from '../utils/error.handler';

export abstract class BaseService<T extends Model> {
  protected model: ModelStatic<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  async findAll(options = {}): Promise<T[]> {
    return this.model.findAll(options);
  }

  async findById(id: number, options = {}): Promise<T> {
    const instance = await this.model.findByPk(id, options);
    if (!instance) {
      throw new AppError(404, `${this.model.name} not found`);
    }
    return instance;
  }

  async create(data: any): Promise<T> {
    return this.model.create(data);
  }

  async update(id: number, data: any): Promise<T> {
    const instance = await this.findById(id);
    return instance.update(data);
  }

  async delete(id: number): Promise<void> {
    const instance = await this.findById(id);
    await instance.destroy();
  }
}