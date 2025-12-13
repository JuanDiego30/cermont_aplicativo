/**
 * @file use-case.interface.ts
 * @description Interfaces para implementar patrón Use Case (Clean Architecture)
 */

/**
 * Interface base para casos de uso con comando/query
 *
 * Uso:
 * ```ts
 * class CreateUserUseCase implements IUseCase<CreateUserCommand, User> {
 *   async execute(command: CreateUserCommand): Promise<User> {
 *     // ...
 *   }
 * }
 * ```
 */
export interface IUseCase<TCommand, TResult> {
    execute(command: TCommand): Promise<TResult> | TResult;
}

/**
 * Interface para casos de uso sin parámetros de entrada
 */
export interface IUseCaseVoid<TResult> {
    execute(): Promise<TResult> | TResult;
}

/**
 * Interface para queries (read-only use cases)
 * Separación CQRS: Commands vs Queries
 */
export interface IQuery<TParams, TResult> {
    execute(params: TParams): Promise<TResult>;
}

/**
 * Interface para queries sin parámetros
 */
export interface IQueryVoid<TResult> {
    execute(): Promise<TResult>;
}

/**
 * Interface para handlers de comandos (CQRS pattern)
 */
export interface ICommandHandler<TCommand, TResult = void> {
    handle(command: TCommand): Promise<TResult>;
}

/**
 * Interface para handlers de queries (CQRS pattern)
 */
export interface IQueryHandler<TQuery, TResult> {
    handle(query: TQuery): Promise<TResult>;
}
