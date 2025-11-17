/**
 * Servicio de cálculo de costos
 * Resuelve: Desconocimiento de costos reales vs presupuestados
 * 
 * @file backend/src/infra/services/CostCalculatorService.ts
 */

import type { WorkPlan } from '../../domain/entities/WorkPlan';

/**
 * Categorías de costos
 */
export enum CostCategory {
  MATERIALS = 'MATERIALS',
  LABOR = 'LABOR',
  EQUIPMENT = 'EQUIPMENT',
  TRANSPORTATION = 'TRANSPORTATION',
  PERMITS = 'PERMITS',
  OVERHEAD = 'OVERHEAD',
}

/**
 * Item de costo
 */
export interface CostItem {
  category: CostCategory;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

/**
 * Resumen de costos
 */
export interface CostSummary {
  budgeted: number;
  actual: number;
  variance: number;
  variancePercentage: number;
  byCategory: Record<CostCategory, {
    budgeted: number;
    actual: number;
    variance: number;
  }>;
}

/**
 * Servicio de cálculo de costos
 * @class CostCalculatorService
 */
export class CostCalculatorService {
  /**
   * Calcula el costo total de items
   */
  calculateTotalCost(items: CostItem[]): number {
    return items.reduce((total, item) => total + item.totalCost, 0);
  }

  /**
   * Calcula el costo por categoría
   */
  calculateCostByCategory(items: CostItem[]): Record<CostCategory, number> {
    const costs: Record<CostCategory, number> = {
      [CostCategory.MATERIALS]: 0,
      [CostCategory.LABOR]: 0,
      [CostCategory.EQUIPMENT]: 0,
      [CostCategory.TRANSPORTATION]: 0,
      [CostCategory.PERMITS]: 0,
      [CostCategory.OVERHEAD]: 0,
    };

    items.forEach((item) => {
      costs[item.category] += item.totalCost;
    });

    return costs;
  }

  /**
   * Calcula la variación entre presupuesto y real
   */
  calculateVariance(budgeted: number, actual: number): {
    variance: number;
    variancePercentage: number;
    status: 'UNDER_BUDGET' | 'ON_BUDGET' | 'OVER_BUDGET';
  } {
    const variance = actual - budgeted;
    const variancePercentage = budgeted > 0 ? (variance / budgeted) * 100 : 0;

    let status: 'UNDER_BUDGET' | 'ON_BUDGET' | 'OVER_BUDGET';
    if (Math.abs(variancePercentage) <= 5) {
      status = 'ON_BUDGET';
    } else if (variancePercentage < 0) {
      status = 'UNDER_BUDGET';
    } else {
      status = 'OVER_BUDGET';
    }

    return {
      variance,
      variancePercentage,
      status,
    };
  }

  /**
   * Genera resumen completo de costos
   */
  generateCostSummary(
    budgetedItems: CostItem[],
    actualItems: CostItem[]
  ): CostSummary {
    const budgetedTotal = this.calculateTotalCost(budgetedItems);
    const actualTotal = this.calculateTotalCost(actualItems);
    const { variance, variancePercentage } = this.calculateVariance(budgetedTotal, actualTotal);

    const budgetedByCategory = this.calculateCostByCategory(budgetedItems);
    const actualByCategory = this.calculateCostByCategory(actualItems);

    const byCategory = Object.values(CostCategory).reduce((acc, category) => {
      const budgeted = budgetedByCategory[category] || 0;
      const actual = actualByCategory[category] || 0;
      
      acc[category] = {
        budgeted,
        actual,
        variance: actual - budgeted,
      };
      
      return acc;
    }, {} as Record<CostCategory, { budgeted: number; actual: number; variance: number }>);

    return {
      budgeted: budgetedTotal,
      actual: actualTotal,
      variance,
      variancePercentage,
      byCategory,
    };
  }

  /**
   * Calcula el costo de mano de obra por horas
   */
  calculateLaborCost(
    hours: number,
    hourlyRate: number,
    overtime: number = 0,
    overtimeMultiplier: number = 1.5
  ): number {
    const regularCost = hours * hourlyRate;
    const overtimeCost = overtime * hourlyRate * overtimeMultiplier;
    return regularCost + overtimeCost;
  }

  /**
   * Calcula el costo de materiales con desperdicio
   */
  calculateMaterialCost(
    quantity: number,
    unitCost: number,
    wastePercentage: number = 10
  ): number {
    const adjustedQuantity = quantity * (1 + wastePercentage / 100);
    return adjustedQuantity * unitCost;
  }

  /**
   * Calcula el costo de transporte por distancia
   */
  calculateTransportationCost(
    distanceKm: number,
    costPerKm: number,
    trips: number = 1
  ): number {
    return distanceKm * costPerKm * trips * 2; // Ida y vuelta
  }

  /**
   * Calcula costos indirectos (overhead)
   */
  calculateOverhead(
    directCosts: number,
    overheadPercentage: number = 15
  ): number {
    return directCosts * (overheadPercentage / 100);
  }

  /**
   * Estima costo total de un plan de trabajo
   */
  estimateWorkPlanCost(workPlan: WorkPlan): CostItem[] {
    const items: CostItem[] = [];

    // Calcular costos de materiales
    if (workPlan.materials && workPlan.materials.length > 0) {
      workPlan.materials.forEach((material) => {
        items.push({
          category: CostCategory.MATERIALS,
          description: material.name,
          quantity: material.quantity,
          unitCost: material.unitCost || 0,
          totalCost: material.quantity * (material.unitCost || 0),
        });
      });
    }

    // Calcular costos de herramientas/equipos
    if (workPlan.tools && workPlan.tools.length > 0) {
      workPlan.tools.forEach((tool) => {
        items.push({
          category: CostCategory.EQUIPMENT,
          description: tool.name,
          quantity: tool.quantity,
          unitCost: 0, // Asumiendo que son herramientas de la empresa
          totalCost: 0,
        });
      });
    }

    // Agregar mano de obra estimada (basado en presupuesto)
    const estimatedHours = 8; // Default 8 hours
    items.push({
      category: CostCategory.LABOR,
      description: 'Mano de obra técnica',
      quantity: estimatedHours,
      unitCost: 50000,
      totalCost: estimatedHours * 50000,
    });

    // Agregar transporte
    items.push({
      category: CostCategory.TRANSPORTATION,
      description: 'Transporte a sitio',
      quantity: 1,
      unitCost: 100000, // Valor ejemplo
      totalCost: 100000,
    });

    return items;
  }

  /**
   * Compara dos presupuestos
   */
  compareBudgets(
    budget1: CostItem[],
    budget2: CostItem[]
  ): {
    differences: Array<{
      category: CostCategory;
      description: string;
      budget1Cost: number;
      budget2Cost: number;
      difference: number;
    }>;
    totalDifference: number;
  } {
    const differences: Array<{
      category: CostCategory;
      description: string;
      budget1Cost: number;
      budget2Cost: number;
      difference: number;
    }> = [];

    const budget1Map = new Map<string, CostItem>();
    budget1.forEach((item) => {
      const key = `${item.category}-${item.description}`;
      budget1Map.set(key, item);
    });

    budget2.forEach((item) => {
      const key = `${item.category}-${item.description}`;
      const budget1Item = budget1Map.get(key);

      if (budget1Item) {
        if (budget1Item.totalCost !== item.totalCost) {
          differences.push({
            category: item.category,
            description: item.description,
            budget1Cost: budget1Item.totalCost,
            budget2Cost: item.totalCost,
            difference: item.totalCost - budget1Item.totalCost,
          });
        }
      } else {
        differences.push({
          category: item.category,
          description: item.description,
          budget1Cost: 0,
          budget2Cost: item.totalCost,
          difference: item.totalCost,
        });
      }
    });

    const totalDifference = differences.reduce((sum, diff) => sum + diff.difference, 0);

    return {
      differences,
      totalDifference,
    };
  }
}

/**
 * Instancia singleton del servicio
 */
export const costCalculatorService = new CostCalculatorService();
