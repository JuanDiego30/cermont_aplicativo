import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  BadGatewayException,
  HttpException,
  InternalServerErrorException,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { LoggerService } from "../../lib/logging/logger.service";

@Injectable()
export class HttpErrorInterceptor implements NestInterceptor {

  constructor(private readonly logger: LoggerService) {}

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
            `[${method}] ${url} - Status: ${status}`,
            "HttpErrorInterceptor",
            {
              status,
              error: response,
              timestamp,
              path: url,
            },
          );

          return throwError(() => error);
        }

        // Para errores no HTTP, loguear y envolver
        this.logger.error(
          `Unhandled error in ${method} ${url}`,
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
