/**
 * CQRS Query Base Interface
 * All queries must implement this interface
 */
export interface IQuery<TResult> {
  readonly __resultType?: TResult;
  readonly filters?: unknown;
}

/**
 * CQRS Query Handler Interface
 */
export interface IQueryHandler<TQuery extends IQuery<TResult>, TResult> {
  execute(query: TQuery): Promise<TResult>;
}
