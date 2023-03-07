export type Address = u8[];
export type ID = u8[];

export class Result<T> {
    private value: T | null = null;
    private error: string | null = null;

    private constructor(val: T | null, msg: string | null) {
        this.value = val;
    }

    public static ok<T>(val: T): Result<T> {
        const result = new Result<T>(val, null);
        return result;
    }

    public static err<T>(msg: string): Result<T> {
        const result = new Result<T>(null, msg);
        return result;
    }

    public isOK(): bool {
        return this.value != null;
    }

    public isErr(): bool {
        return this.error != null;
    }

    public ok(): T {
        assert(this.value, 'value must exist when calling err.');
        if (this.value == null) {
            unreachable();
        }
        return this.value;
    }

    public okOr(opt: T): T {
        if (this.value == null) {
            return opt;
        }
        return this.value;
    }

    public err(): string {
        assert(this.error, 'error must exist when calling err.');
        if (this.error == null) {
            unreachable();
        }
        return this.error;
    }
 }
