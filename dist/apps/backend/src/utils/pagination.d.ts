import { type Model, type Document, type FilterQuery, type PopulateOptions } from 'mongoose';
export interface PaginationMetadata {
    limit: number;
    count: number;
    hasMore: boolean;
}
export interface CursorPaginationMetadata extends PaginationMetadata {
    cursor: string | null;
    nextCursor: string | null;
}
export interface OffsetPaginationMetadata extends PaginationMetadata {
    page: number;
    total: number;
    pages: number;
}
export interface PaginationResult<T extends Document> {
    docs: T[];
    pagination: CursorPaginationMetadata | OffsetPaginationMetadata;
}
export interface BasePaginationOptions {
    limit?: number;
    sort?: Record<string, 1 | -1> | string;
    populate?: PopulateOptions[];
    select?: string | Record<string, any> | null;
}
export interface CursorPaginationOptions extends BasePaginationOptions {
    cursor?: string | null;
}
export interface OffsetPaginationOptions extends BasePaginationOptions {
    page?: number;
}
export declare const sanitizeFilters: <T extends Document>(filters: FilterQuery<T>) => FilterQuery<T>;
export declare const cursorPaginate: <T extends Document>(model: Model<T>, filters?: FilterQuery<T>, options?: CursorPaginationOptions) => Promise<PaginationResult<T>>;
export declare const offsetPaginate: <T extends Document>(model: Model<T>, filters?: FilterQuery<T>, options?: OffsetPaginationOptions) => Promise<PaginationResult<T>>;
export declare const autoPaginate: <T extends Document>(model: Model<T>, filters: FilterQuery<T>, options?: CursorPaginationOptions | OffsetPaginationOptions) => Promise<PaginationResult<T>>;
declare const _default: {
    cursorPaginate: <T extends Document>(model: Model<T>, filters?: FilterQuery<T>, options?: CursorPaginationOptions) => Promise<PaginationResult<T>>;
    offsetPaginate: <T extends Document>(model: Model<T>, filters?: FilterQuery<T>, options?: OffsetPaginationOptions) => Promise<PaginationResult<T>>;
    autoPaginate: <T extends Document>(model: Model<T>, filters: FilterQuery<T>, options?: CursorPaginationOptions | OffsetPaginationOptions) => Promise<PaginationResult<T>>;
};
export default _default;
//# sourceMappingURL=pagination.d.ts.map