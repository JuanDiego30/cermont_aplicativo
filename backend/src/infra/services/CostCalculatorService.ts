/**
 * Servicio de cálculo de costos
 * Resuelve: Desconocimiento de costos reales vs presupuestados
 * 
 * @file backend/src/infra/services/CostCalculatorService.ts
 */

import type { WorkPlan } from '../../domain/entities/WorkPlan.js';

// ==========================================
// Tipos y Enums
// ==========================================

export enum CostCategory {
  MATERIALS = 'MATERIALS',
  LABOR = 'LABOR',
  EQUIPMENT = 'EQUIPMENT',
  TRANSPORTATION = 'TRANSPORTATION',
  PERMITS = 'PERMITS',
  OVERHEAD = 'OVERHEAD',
}

export interface CostItem {
  category: CostCategory;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface CostSummary {
  budgeted: number;
  actual: number;
  variance: number;
  variancePercentage: number;
  byCategory: Record<CostCategory, CategorySummary>;
}

interface CategorySummary {
  budgeted: number;
  actual: number;
  variance: number;
}

export interface CostRates {
  laborHourlyRate: number;
  overtimeMultiplier: number;
  transportTripCost: number;
  defaultOverheadPercentage: number;
  defaultWastePercentage: number;
}

// ==========================================
// Servicio
// ==========================================

export class CostCalculatorService {
  
  // Tarifas por defecto (Idealmente deberían venir de una BD o configuración)
  private rates: CostRates = {
    laborHourlyRate: 50000,
    overtimeMultiplier: 1.5,
    transportTripCost: 100000,
    defaultOverheadPercentage: 15,
    defaultWastePercentage: 10,
  };

  constructor(customRates?: Partial<CostRates>) {
    if (customRates) {
      this.rates = { ...this.rates, ...customRates };
    }
  }

  /**
   * Calcula el costo total de una lista de items
   */
  calculateTotalCost(items: CostItem[]): number {
    return items.reduce((total, item) => total + item.totalCost, 0);
  }

  /**
   * Agrupa costos por categoría
   */
  calculateCostByCategory(items: CostItem[]): Record<CostCategory, number> {
    // Inicializar todas las categorías en 0
    const costs = Object.values(CostCategory).reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {} as Record<CostCategory, number>);

    items.forEach((item) => {
      if (costs[item.category] !== undefined) {
        costs[item.category] += item.totalCost;
      }
    });

    return costs;
  }

  /**
   * Genera un resumen comparativo completo
   */
  generateCostSummary(budgetedItems: CostItem[], actualItems: CostItem[]): CostSummary {
    const budgetedTotal = this.calculateTotalCost(budgetedItems);
    const actualTotal = this.calculateTotalCost(actualItems);
    
    const variance = actualTotal - budgetedTotal;
    const variancePercentage = budgetedTotal > 0 ? (variance / budgetedTotal) * 100 : 0;

    const budgetedByCategory = this.calculateCostByCategory(budgetedItems);
    const actualByCategory = this.calculateCostByCategory(actualItems);

    const byCategory = Object.values(CostCategory).reduce((acc, category) => {
      const budget = budgetedByCategory[category] || 0;
      const actual = actualByCategory[category] || 0;
      
      acc[category] = {
        budgeted: budget,
        actual: actual,
        variance: actual - budget,
      };
      return acc;
    }, {} as Record<CostCategory, CategorySummary>);

    return {
      budgeted: budgetedTotal,
      actual: actualTotal,
      variance,
      variancePercentage,
      byCategory,
    };
  }

  // ----------------------------------------------------------------
  // Métodos de Cálculo Específicos (Usando tasas configuradas)
  // ----------------------------------------------------------------

  calculateLaborCost(hours: number, overtime: number = 0): number {
    const regularCost = hours * this.rates.laborHourlyRate;
    const overtimeCost = overtime * this.rates.laborHourlyRate * this.rates.overtimeMultiplier;
    return regularCost + overtimeCost;
  }

  calculateMaterialCost(quantity: number, unitCost: number): number {
    const adjustedQuantity = quantity * (1 + this.rates.defaultWastePercentage / 100);
    return adjustedQuantity * unitCost;
  }

  calculateTransportationCost(trips: number = 1): number {
    // Asumiendo ida y vuelta incluido en la tarifa base del viaje
    return trips * this.rates.transportTripCost; 
  }

  // ----------------------------------------------------------------
  // Estimación de Plan de Trabajo
  // ----------------------------------------------------------------

  estimateWorkPlanCost(workPlan: WorkPlan): CostItem[] {
    const items: CostItem[] = [];

    // 1. Materiales
    workPlan.materials?.forEach((material) => {
      const cost = (material.quantity || 0) * (material.unitCost || 0);
      items.push(this.createItem(CostCategory.MATERIALS, material.name, material.quantity, material.unitCost || 0, cost));
    });

    // 2. Herramientas / Equipos (Costo 0 si son propios, o implementar lógica de alquiler)
    workPlan.tools?.forEach((tool) => {
      items.push(this.createItem(CostCategory.EQUIPMENT, tool.name, tool.quantity, 0, 0));
    });

    // 3. Mano de Obra (Estimación base: 8 horas)
    const estimatedHours = 8;
    const laborCost = this.calculateLaborCost(estimatedHours);
    items.push(this.createItem(CostCategory.LABOR, 'Mano de obra técnica (Est.)', estimatedHours, this.rates.laborHourlyRate, laborCost));

    // 4. Transporte (Estimación base: 1 viaje)
    const transportCost = this.calculateTransportationCost(1);
    items.push(this.createItem(CostCategory.TRANSPORTATION, 'Transporte a sitio (Est.)', 1, transportCost, transportCost));

    return items;
  }

  // ----------------------------------------------------------------
  // Comparación de Presupuestos
  // ----------------------------------------------------------------

  compareBudgets(budget1: CostItem[], budget2: CostItem[]) {
    const differences: Array<any> = [];
    
    // Crear mapa para búsqueda rápida O(1)
    const budget1Map = new Map(budget1.map(item => [`${item.category}:${item.description}`, item]));
    const processedKeys = new Set<string>();

    // Paso 1: Comparar items en budget2 contra budget1
    budget2.forEach(item2 => {
      const key = `${item2.category}:${item2.description}`;
      processedKeys.add(key);
      
      const item1 = budget1Map.get(key);
      const cost1 = item1 ? item1.totalCost : 0;
      const diff = item2.totalCost - cost1;

      if (diff !== 0) {
        differences.push({
          category: item2.category,
          description: item2.description,
          budget1Cost: cost1,
          budget2Cost: item2.totalCost,
          difference: diff
        });
      }
    });

    // Paso 2: Encontrar items que estaban en budget1 pero NO en budget2
    budget1.forEach(item1 => {
      const key = `${item1.category}:${item1.description}`;
      if (!processedKeys.has(key)) {
        differences.push({
          category: item1.category,
          description: item1.description,
          budget1Cost: item1.totalCost,
          budget2Cost: 0,
          difference: -item1.totalCost // Diferencia negativa (ahorro o recorte)
        });
      }
    });

    const totalDifference = differences.reduce((sum, item) => sum + item.difference, 0);

    return { differences, totalDifference };
  }

  // Helper privado para crear items consistentemente
  private createItem(category: CostCategory, description: string, qty: number, unit: number, total: number): CostItem {
    return { category, description, quantity: qty, unitCost: unit, totalCost: total };
  }
}

export const costCalculatorService = new CostCalculatorService();

