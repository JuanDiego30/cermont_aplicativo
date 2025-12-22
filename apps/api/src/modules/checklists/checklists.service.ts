/**
 * @service ChecklistsService
 * 
 * TEMPORALMENTE DESHABILITADO - necesita actualización completa
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChecklistsService {
  // Service temporalmente deshabilitado
  async findByEjecucion() {
    throw new Error('ChecklistsService temporalmente deshabilitado');
  }

  async findOne() {
    throw new Error('ChecklistsService temporalmente deshabilitado');
  }

  async create() {
    throw new Error('ChecklistsService temporalmente deshabilitado');
  }

  async addItems() {
    throw new Error('ChecklistsService temporalmente deshabilitado');
  }

  async toggleItem() {
    throw new Error('ChecklistsService temporalmente deshabilitado');
  }

  async updateItem() {
    throw new Error('ChecklistsService temporalmente deshabilitado');
  }

  async completar() {
    throw new Error('ChecklistsService temporalmente deshabilitado');
  }

  async delete() {
    throw new Error('ChecklistsService temporalmente deshabilitado');
  }

  async getStatistics() {
    throw new Error('ChecklistsService temporalmente deshabilitado');
  }

  async getResumenConformidades() {
    throw new Error('ChecklistsService temporalmente deshabilitado');
  }

  async findAllTemplates() {
    throw new Error('ChecklistsService temporalmente deshabilitado');
  }

  async getTemplatesByTipo() {
    throw new Error('ChecklistsService temporalmente deshabilitado');
  }

  async createTemplate() {
    throw new Error('ChecklistsService temporalmente deshabilitado');
  }

  async syncOfflineData() {
    throw new Error('ChecklistsService temporalmente deshabilitado');
  }
}

