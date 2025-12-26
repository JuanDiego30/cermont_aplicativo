import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';
// import { $Enums } from '@prisma/client';

export class CreateOrderDto {
    @ApiProperty({ description: 'Título de la orden' })
    @IsString()
    @IsNotEmpty()
    title!: string;

    @ApiProperty({ description: 'Descripción detallada' })
    @IsString()
    @IsNotEmpty()
    description!: string;

    // @ApiProperty({ enum: $Enums.OrderStatus })
    // @IsEnum($Enums.OrderStatus)
    // status!: $Enums.OrderStatus;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    scheduledDate?: string;

    @ApiProperty({ description: 'ID del cliente' })
    @IsString()
    @IsNotEmpty()
    clientId!: string;
}
