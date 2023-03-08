export type Address = u8[];
export type ID = u8[];

// @ts-ignore
@inline
export function instantiateZero<T>(): T {
    if (isInteger<T>()) {
        return 0 as T;
    } else if (isBoolean<T>()) {
        return false as T;
    } else if (isReference<T>()) {
        return changetype<T>(0);
    }
    return instantiate<T>();
}

export class Result<T> {
    private _value: T;
    private _error: string;
    private _ok: bool

    private constructor(ok: bool, val: T = instantiateZero<T>(), msg: string = "") {
        this._value = val;
        this._ok = ok;
        this._error = "";
    }

    public static ok<T>(val: T): Result<T> {
        const result = new Result<T>(true, val);
        return result;
    }

    public static err<T>(msg: string): Result<T> {
        const result = new Result<T>(false, instantiateZero<T>(), msg);
        return result;
    }

    public isOK(): bool {
        return this._ok;
    }

    public isErr(): bool {
        return !this._ok;
    }

    public ok(): T {
        assert(this._ok, 'result must be ok when calling ok.');
        if (!this._ok) {
            unreachable();
        }
        return this._value;
    }

    public okOr(opt: T): T {
        if (!this._ok) {
            return opt;
        }
        return this._value;
    }

    public err(): string {
        assert(!this._ok, 'error must exist when calling err.');
        if (!this._ok) {
            unreachable();
        }
        return this._error;
    }

    public mapErr<K>(): Result<K> {
        assert(!this._ok, 'error must exist when calling err.');
        if (this._ok) {
            unreachable();
        }
        return new Result<K>(false, instantiateZero<K>(), this._error);
    }
 }
