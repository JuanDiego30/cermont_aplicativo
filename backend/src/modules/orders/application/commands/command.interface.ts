/**
 * CQRS Command Base Interface
 * All commands must implement this interface
 */
export interface ICommand<TResult = void> {
  readonly __resultType?: TResult;
  readonly payload?: unknown;
}

/**
 * CQRS Command Handler Interface
 */
export interface ICommandHandler<TCommand extends ICommand<TResult>, TResult = void> {
  execute(command: TCommand): Promise<TResult>;
}
