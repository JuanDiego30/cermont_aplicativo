import { TipoAlerta } from '@/prisma/client';

export { TipoAlerta as TipoAlertaEnum };

export class TipoAlertaVO {
  private constructor(private readonly value: TipoAlerta) {}

  static create(value: TipoAlerta): TipoAlertaVO {
    return new TipoAlertaVO(value);
  }

  getValue(): TipoAlerta {
    return this.value;
  }
}
