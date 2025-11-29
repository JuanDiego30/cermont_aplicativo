export interface CostVarianceResult {
  variance: number;
  variancePercentage: number;
  status: 'OK' | 'ALERTA' | 'EXCEDIDO';
}

export interface ICostCalculatorService {
  /**
   * Calcula la variación y estado de salud financiera.
   */
  calculateVariance(budgeted: number, real: number): CostVarianceResult;

  /**
   * Calcula costo total de una lista de materiales.
   */
  calculateMaterialsCost(materials: Array<{ quantity: number; unitCost: number }>): number;

  /**
   * Calcula costo de mano de obra.
   * @param rateMultiplier Factor multiplicador (ej: 1.5 para horas extra)
   */
  calculateLaborCost(hours: number, hourlyRate: number, rateMultiplier?: number): number;
}

