import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  BadGatewayException,
  HttpException,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { PinoLoggerService } from "../logger/pino-logger.service";

@Injectable()
export class HttpErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpErrorInterceptor.name);

  constructor(private readonly pinoLogger: PinoLoggerService) {}

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

          this.pinoLogger.log(
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
        this.pinoLogger.error(
          `Unhandled error in ${method} ${url}`,
          error.stack,
          "HttpErrorInterceptor",
          {
            method,
            url,
            body,
            timestamp,
            errorMessage: error.message,
            errorName: error.name,
          },
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
