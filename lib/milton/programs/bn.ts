export class BN {
    private n: bigint;
  
    constructor(number: number | string | BN, base: number = 10, endian: string = 'be') {
      if (typeof number === 'number') {
        this.n = BigInt(number);
      } else if (typeof number === 'string') {
        this.n = BigInt(parseInt(number, base));
      } else if (number instanceof BN) {
        this.n = number.n;
      } else {
        throw new Error('Invalid number format');
      }
    }
  
    toString(base: number = 10): string {
      return this.n.toString(base);
    }
  
    toNumber(): number {
      return Number(this.n);
    }
  
    add(other: number | string | BN): BN {
      return new BN(this.n + new BN(other).n);
    }
  
    sub(other: number | string | BN): BN {
      return new BN(this.n - new BN(other).n);
    }
  
    mul(other: number | string | BN): BN {
      return new BN(this.n * new BN(other).n);
    }
  
    div(other: number | string | BN): BN {
      return new BN(this.n / new BN(other).n);
    }
  
    mod(other: number | string | BN): BN {
      return new BN(this.n % new BN(other).n);
    }
  
    pow(exponent: number): BN {
      return new BN(this.n ** BigInt(exponent));
    }
  
    abs(): BN {
      return new BN(this.n < 0n ? -this.n : this.n);
    }
  
    neg(): BN {
      return new BN(-this.n);
    }
  
    eq(other: number | string | BN): boolean {
      return this.n === new BN(other).n;
    }
  
    lt(other: number | string | BN): boolean {
      return this.n < new BN(other).n;
    }
  
    lte(other: number | string | BN): boolean {
      return this.n <= new BN(other).n;
    }
  
    gt(other: number | string | BN): boolean {
      return this.n > new BN(other).n;
    }
  
    gte(other: number | string | BN): boolean {
      return this.n >= new BN(other).n;
    }
  
    isZero(): boolean {
      return this.n === 0n;
    }
  
    isNeg(): boolean {
      return this.n < 0n;
    }
  
    isPos(): boolean {
      return this.n > 0n;
    }
  
    clone(): BN {
      return new BN(this.n);
    }
  
    static min(...args: (number | string | BN)[]): BN {
      return args.reduce((min, curr) => (new BN(curr).lt(min) ? new BN(curr) : min), new BN(args[0]));
    }
  
    static max(...args: (number | string | BN)[]): BN {
      return args.reduce((max, curr) => (new BN(curr).gt(max) ? new BN(curr) : max), new BN(args[0]));
    }
  }