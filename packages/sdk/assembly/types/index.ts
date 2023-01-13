export type Address = Uint8Array;

export const enum Status {
    Fail = 2,
    Ok = 1,
}

export class Result<T> {
    value: T;
    error: string | null = null;
    status: Status = Status.Fail;

    constructor(val: T) {
        this.value = val;
    }

    public static success<T>(val: T): Result<T> {
        const result = new Result<T>(val);
        result.status = Status.Ok;
        return result;
    }

    public static error(msg: string): Result<bool> {
        const result = new Result<bool>(false);
        result.error = msg;
        return result;
    }

    public ok(): bool {
        return this.status == Status.Ok;
    }

    public err(): string | null {
        return this.error;
    }

    public val(): T {
        if (this.value == null) {
            abort('');
        }
        return this.value;
    }
 }
