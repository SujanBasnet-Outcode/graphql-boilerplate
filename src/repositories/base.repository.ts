import { ReturnModelType, getModelForClass } from '@typegoose/typegoose';
import { ProjectionType, QueryOptions } from 'mongoose';

export class BaseRepository<T> {
	private model: ReturnModelType<new () => T>;

	constructor(modelClass: new () => T) {
		this.model = getModelForClass(modelClass);
	}

	async findAll(
		conditions: Partial<T>,
		projection?: ProjectionType<T> | string,
		options?: QueryOptions
	) {
		const query = await this.model.find(conditions, projection, options);
		return query;
	}

	async findOne(
		conditions: Partial<T>,
		projection?: ProjectionType<T>,
		options?: QueryOptions
	) {
		const query = await this.model.findOne(conditions, projection, options);
		return query;
	}

	async findById(id: string) {
		const query = await this.model.findById(id);
		return query;
	}

	async create(doc: Partial<T>) {
		return this.model.create(doc);
	}

	async insertMany(docs: Partial<T[]>) {
		return this.model.insertMany(docs);
	}

	async findOneAndUpdate(
		conditions: Partial<T>,
		update: Partial<T>,
		options?: QueryOptions
	) {
		return this.model.findOneAndUpdate(conditions, update, options);
	}

	async findByIdAndUpdate(
		id: string,
		update: Partial<T>,
		options?: QueryOptions
	) {
		return this.model.findByIdAndUpdate(id, update, options);
	}

	async deleteOne(conditions: Partial<T>) {
		return this.model.deleteOne(conditions);
	}

	async deleteMany(conditions: Partial<T>): Promise<{ deletedCount: number }> {
		const result = await this.model.deleteMany(conditions);
		return { deletedCount: result.deletedCount };
	}

	async count(conditions: Partial<T>): Promise<number> {
		return this.model.countDocuments(conditions);
	}
}
