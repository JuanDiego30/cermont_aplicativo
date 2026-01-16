import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export enum InspectionFormTypeDto {
  ARNES = 'ARNES',
  ESCALERA = 'ESCALERA',
  CCTV = 'CCTV',
}

export class SubmitInspectionFormDto {
  @IsString()
  orderId!: string;

  @IsEnum(InspectionFormTypeDto)
  type!: InspectionFormTypeDto;

  data!: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  photos?: string[];
}
