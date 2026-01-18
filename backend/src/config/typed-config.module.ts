/**
 * NestJS Typed Configuration Module
 *
 * Provides the TypedConfigService globally across the application.
 */
import { Global, Module } from '@nestjs/common';
import { TypedConfigService } from './typed-config.service';

@Global()
@Module({
  providers: [TypedConfigService],
  exports: [TypedConfigService],
})
export class TypedConfigModule {}
