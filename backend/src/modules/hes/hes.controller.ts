import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateHESDto, UpdateHESDto } from './hes.dto';
import { HESService } from './hes.service';

@ApiTags('hes')
@ApiBearerAuth()
@Controller({ path: 'hes', version: '1' })
export class HESController {
  constructor(private readonly hesService: HESService) {}

  @Get()
  @ApiOperation({ summary: 'List all HES' })
  async findAll(@Query('estado') estado?: string, @Query('ordenId') ordenId?: string) {
    return this.hesService.findAll({ estado, ordenId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get HES by ID' })
  async findOne(@Param('id') id: string) {
    return this.hesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new HES' })
  async create(@Body() dto: CreateHESDto) {
    const userId = 'system'; // TODO: Get from JWT
    return this.hesService.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update HES' })
  async update(@Param('id') id: string, @Body() dto: UpdateHESDto) {
    return this.hesService.update(id, dto);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete HES' })
  async complete(@Param('id') id: string) {
    return this.hesService.complete(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete HES' })
  async delete(@Param('id') id: string) {
    await this.hesService.delete(id);
  }
}
