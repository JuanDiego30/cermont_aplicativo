/**
 * @valueObject CierreTotals
 * 
 * Financial totals calculated from line items.
 * Uses number for simplicity (consider Decimal.js for production).
 */

export class CierreTotals {
    private constructor(
        private readonly totalMateriales: number,
        private readonly totalManoObra: number,
        private readonly totalOtros: number,
        private readonly totalGeneral: number,
    ) {
        Object.freeze(this);
    }

    static calculate(items: { categoria: string; subtotal: number }[]): CierreTotals {
        let materiales = 0;
        let manoObra = 0;
        let otros = 0;

        for (const item of items) {
            if (item.categoria === 'MATERIAL') {
                materiales += item.subtotal;
            } else if (item.categoria === 'MANO_OBRA') {
                manoObra += item.subtotal;
            } else {
                otros += item.subtotal;
            }
        }

        return new CierreTotals(
            Math.round(materiales * 100) / 100,
            Math.round(manoObra * 100) / 100,
            Math.round(otros * 100) / 100,
            Math.round((materiales + manoObra + otros) * 100) / 100,
        );
    }

    static fromValues(props: {
        totalMateriales: number;
        totalManoObra: number;
        totalOtros: number;
        totalGeneral: number;
    }): CierreTotals {
        return new CierreTotals(
            props.totalMateriales,
            props.totalManoObra,
            props.totalOtros,
            props.totalGeneral,
        );
    }

    getTotalMateriales(): number {
        return this.totalMateriales;
    }

    getTotalManoObra(): number {
        return this.totalManoObra;
    }

    getTotalOtros(): number {
        return this.totalOtros;
    }

    getTotalGeneral(): number {
        return this.totalGeneral;
    }

    toJSON(): Record<string, number> {
        return {
            totalMateriales: this.totalMateriales,
            totalManoObra: this.totalManoObra,
            totalOtros: this.totalOtros,
            totalGeneral: this.totalGeneral,
        };
    }

    equals(other: CierreTotals): boolean {
        return (
            other instanceof CierreTotals &&
            this.totalGeneral === other.totalGeneral
        );
    }

    toString(): string {
        return `Total: ${this.totalGeneral}`;
    }
}
