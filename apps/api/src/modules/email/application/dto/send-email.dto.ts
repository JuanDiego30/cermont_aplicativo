
import { IsString, IsEmail, IsNotEmpty, IsOptional, IsArray, IsObject, ValidateNested, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AttachmentDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    filename!: string;

    @ApiProperty()
    @IsNotEmpty()
    content!: string | Buffer;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    contentType?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    size?: number;
}

export class SendEmailDto {
    @ApiProperty({ description: 'Destinatario del correo' })
    @IsEmail()
    @IsNotEmpty()
    to!: string;

    @ApiProperty({ description: 'Asunto del correo' })
    @IsString()
    @IsNotEmpty()
    subject!: string;

    @ApiProperty({ description: 'Contenido HTML del correo' })
    @IsString()
    @IsNotEmpty()
    content!: string;

    @ApiProperty({ required: false, type: [String] })
    @IsOptional()
    @IsArray()
    @IsEmail({}, { each: true })
    @ArrayMaxSize(50)
    cc?: string[];

    @ApiProperty({ required: false, type: [String] })
    @IsOptional()
    @IsArray()
    @IsEmail({}, { each: true })
    @ArrayMaxSize(50)
    bcc?: string[];

    @ApiProperty({ required: false, type: [AttachmentDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AttachmentDto)
    attachments?: AttachmentDto[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}
