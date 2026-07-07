import { Query } from 'mongoose';

interface QueryParams {
  search?: string;
  searchFields?: string;
  sort?: string;
  page?: string;
  limit?: string;
  [key: string]: any;
}

class QueryBuilder<T> {
  query: Query<T[], T>;
  queryParams: QueryParams;

  constructor(query: Query<T[], T>, queryParams: QueryParams) {
    this.query = query;
    this.queryParams = queryParams;
  }

  search(searchableFields: string[]): this {
    const searchTerm = this.queryParams.search;
    if (searchTerm) {
      const searchConditions = searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      }));
      this.query = this.query.find({ $or: searchConditions } as any);
    }
    return this;
  }

  filter(): this {
    const excludeFields = ['search', 'searchFields', 'sort', 'page', 'limit', 'fields'];
    const filterObj: Record<string, any> = {};

    Object.keys(this.queryParams).forEach((key) => {
      if (!excludeFields.includes(key) && this.queryParams[key]) {
        // Handle operators like gte, gt, lte, lt
        if (typeof this.queryParams[key] === 'string' && this.queryParams[key].includes(',')) {
          filterObj[key] = { $in: this.queryParams[key].split(',') };
        } else {
          filterObj[key] = this.queryParams[key];
        }
      }
    });

    if (Object.keys(filterObj).length > 0) {
      this.query = this.query.find(filterObj);
    }
    return this;
  }

  sort(): this {
    if (this.queryParams.sort) {
      const sortBy = this.queryParams.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate(): this {
    const page = parseInt(this.queryParams.page || '1', 10);
    const limit = parseInt(this.queryParams.limit || '10', 10);
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  async countTotal(): Promise<number> {
    const countQuery = this.query.model.find(this.query.getFilter());
    return countQuery.countDocuments();
  }
}

export default QueryBuilder;
