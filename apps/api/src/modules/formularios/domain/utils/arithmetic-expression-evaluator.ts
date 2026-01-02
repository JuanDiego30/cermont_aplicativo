/**
 * Util: ArithmeticExpressionEvaluator
 *
 * Evaluador seguro para expresiones aritméticas simples.
 * Soporta: números, paréntesis, + - * /, decimales y espacios.
 *
 * No soporta variables ni llamadas a funciones.
 */

type Operator = '+' | '-' | '*' | '/' | 'u-';

type Token =
  | { type: 'number'; value: number }
  | { type: 'op'; value: Operator }
  | { type: 'lparen' }
  | { type: 'rparen' };

export class ArithmeticExpressionEvaluator {
  private static readonly SAFE_PATTERN = /^[\d\s+\-*/().]+$/;

  static evaluate(expression: string): number {
    const trimmed = expression.trim();
    if (trimmed.length === 0) {
      throw new Error('Empty expression');
    }

    if (!this.SAFE_PATTERN.test(trimmed)) {
      throw new Error('Invalid characters in expression');
    }

    const tokens = this.tokenize(trimmed);
    const rpn = this.toRpn(tokens);
    const result = this.evalRpn(rpn);

    if (!Number.isFinite(result)) {
      throw new Error('Non-finite result');
    }

    return result;
  }

  private static tokenize(expression: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    const pushUnaryAwareOperator = (opChar: '+' | '-'): void => {
      const prev = tokens[tokens.length - 1];
      const isUnary =
        !prev ||
        prev.type === 'op' ||
        prev.type === 'lparen';

      if (isUnary) {
        if (opChar === '+') {
          return;
        }
        tokens.push({ type: 'op', value: 'u-' });
        return;
      }

      tokens.push({ type: 'op', value: opChar });
    };

    while (i < expression.length) {
      const ch = expression[i];

      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
        i++;
        continue;
      }

      if (ch === '(') {
        tokens.push({ type: 'lparen' });
        i++;
        continue;
      }

      if (ch === ')') {
        tokens.push({ type: 'rparen' });
        i++;
        continue;
      }

      if (ch === '+' || ch === '-') {
        pushUnaryAwareOperator(ch);
        i++;
        continue;
      }

      if (ch === '*' || ch === '/') {
        tokens.push({ type: 'op', value: ch });
        i++;
        continue;
      }

      // Número: 12 | 12.34 | .5
      if ((ch >= '0' && ch <= '9') || ch === '.') {
        const match = expression.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
        if (!match) {
          throw new Error('Invalid number');
        }

        const raw = match[0];
        const value = Number(raw);
        if (Number.isNaN(value)) {
          throw new Error('Invalid number');
        }

        tokens.push({ type: 'number', value });
        i += raw.length;
        continue;
      }

      throw new Error(`Unexpected character: ${ch}`);
    }

    return tokens;
  }

  private static precedence(op: Operator): number {
    switch (op) {
      case 'u-':
        return 3;
      case '*':
      case '/':
        return 2;
      case '+':
      case '-':
        return 1;
    }
  }

  private static isRightAssociative(op: Operator): boolean {
    return op === 'u-';
  }

  private static toRpn(tokens: Token[]): Token[] {
    const output: Token[] = [];
    const ops: Token[] = [];

    for (const token of tokens) {
      if (token.type === 'number') {
        output.push(token);
        continue;
      }

      if (token.type === 'op') {
        while (ops.length > 0) {
          const top = ops[ops.length - 1];
          if (top.type !== 'op') break;

          const p1 = this.precedence(token.value);
          const p2 = this.precedence(top.value);
          const rightAssoc = this.isRightAssociative(token.value);

          const shouldPop = rightAssoc ? p1 < p2 : p1 <= p2;
          if (!shouldPop) break;

          output.push(ops.pop() as Token);
        }

        ops.push(token);
        continue;
      }

      if (token.type === 'lparen') {
        ops.push(token);
        continue;
      }

      if (token.type === 'rparen') {
        let foundLeft = false;
        while (ops.length > 0) {
          const top = ops.pop() as Token;
          if (top.type === 'lparen') {
            foundLeft = true;
            break;
          }
          output.push(top);
        }
        if (!foundLeft) {
          throw new Error('Unbalanced parentheses');
        }
        continue;
      }
    }

    while (ops.length > 0) {
      const top = ops.pop() as Token;
      if (top.type === 'lparen' || top.type === 'rparen') {
        throw new Error('Unbalanced parentheses');
      }
      output.push(top);
    }

    return output;
  }

  private static evalRpn(tokens: Token[]): number {
    const stack: number[] = [];

    for (const token of tokens) {
      if (token.type === 'number') {
        stack.push(token.value);
        continue;
      }

      if (token.type !== 'op') {
        throw new Error('Invalid RPN');
      }

      if (token.value === 'u-') {
        const a = stack.pop();
        if (a === undefined) throw new Error('Invalid unary operator');
        stack.push(-a);
        continue;
      }

      const b = stack.pop();
      const a = stack.pop();
      if (a === undefined || b === undefined) {
        throw new Error('Invalid binary operator');
      }

      switch (token.value) {
        case '+':
          stack.push(a + b);
          break;
        case '-':
          stack.push(a - b);
          break;
        case '*':
          stack.push(a * b);
          break;
        case '/':
          stack.push(a / b);
          break;
      }
    }

    if (stack.length !== 1) {
      throw new Error('Invalid expression');
    }

    return stack[0];
  }
}
