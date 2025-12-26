import { ApiProperty } from '@nestjs/swagger';

export class OrderResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    orderNumber!: string;

    @ApiProperty()
    clientId!: string;

    @ApiProperty()
    status!: string;

    @ApiProperty()
    serviceType!: string;

    @ApiProperty()
    description!: string;

    @ApiProperty({ required: false })
    assignedTo?: string;

    @ApiProperty({ required: false })
    estimatedHours?: number;

    @ApiProperty({ required: false })
    actualHours?: number;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
