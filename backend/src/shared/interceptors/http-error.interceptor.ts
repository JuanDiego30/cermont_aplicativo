import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  HttpException,
  InternalServerErrorException,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { LoggerService } from "@/shared/logging/logger.service";

@Injectable()
export class HttpErrorInterceptor implements NestInterceptor {
  private readonly logger: LoggerService;

  constructor() {
    this.logger = new LoggerService(HttpErrorInterceptor.name);
  }

  intercept(context: ExecutionContext, next: any): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const request = context.switchToHttp().getRequest();
        const { method, url, body } = request;
        const timestamp = new Date().toISOString();

        // Si ya es HttpException, solo loguear
        if (error instanceof HttpException) {
          const status = error.getStatus();
          const response = error.getResponse();

          this.logger.log(
            `[${method}] ${url} - Status: ${status} | response: ${JSON.stringify(response)}`,
            "HttpErrorInterceptor",
          );

          return throwError(() => error);
        }

        // Para errores no HTTP, loguear y envolver
        this.logger.error(
          `Unhandled error in ${method} ${url}: ${error.message}`,
          error.stack,
          "HttpErrorInterceptor",
        );

        // Retornar error genérico para no exponer detalles
        return throwError(
          () =>
            new InternalServerErrorException({
              statusCode: 500,
              message: "Internal server error",
              timestamp,
              path: url,
            }),
        );
      }),
    );
  }
}
