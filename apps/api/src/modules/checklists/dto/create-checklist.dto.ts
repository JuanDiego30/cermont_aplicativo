import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export type ChecklistItemEstado = 'CONFORME' | 'NO_CONFORME' | 'NA';

export class CreateChecklistItemDto {
    @IsString()
    nombre!: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsString()
    estado!: ChecklistItemEstado;

    @IsOptional()
    @IsString()
    observaciones?: string;
}

export class CreateChecklistDto {
    @IsString()
    ejecucionId!: string;

    @IsOptional()
    @IsString()
    templateId?: string;

    @IsString()
    nombre!: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateChecklistItemDto)
    items?: CreateChecklistItemDto[];
}

export class UpdateChecklistItemDto {
    @IsString()
    estado!: ChecklistItemEstado;

    @IsOptional()
    @IsString()
    observaciones?: string;
}
