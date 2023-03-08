import * as dev from "../dev";
import * as encoding from "../encoding";
import * as types from "../type_def";

export type Address = u8[];
export type ID = u8[];

// @ts-ignore
@inline
    export function instantiateZero<T>(): T {
    if (isInteger<T>()) {
        return 0 as T;
    } else if (isBoolean<T>()) {
        return false as T;
    } else if (isArray<T>()) {
        return [] as T;
    } else if (isReference<T>()) {
        return changetype<T>(0);
    }
    return instantiate<T>();
}

export enum RuntimeErrorCode {
    UNKNOWN = u32(0),
}

@codec
export class RuntimeError extends encoding.EncodeDecoder {
    @fieldNumber(1)
    message: string = '';
    @fieldNumber(2)
    code: u32 = 0;

    constructor(msg: string = '', code: RuntimeErrorCode = RuntimeErrorCode.UNKNOWN) {
        super();
        this.message = msg;
        this.code = code;
    }
}

export class Result<T> {
    private _value: T;
    private _error: string;
    private _ok: bool;

    private constructor(ok: bool, val: T = instantiateZero<T>(), msg: string = "") {
        this._value = val;
        this._ok = ok;
        this._error = "";
    }

    public static ok<T = bool>(val: T): Result<T> {
        const result = new Result<T>(true, val);
        return result;
    }

    public static err<T = bool>(msg: string): Result<T> {
        const result = new Result<T>(false, instantiateZero<T>(), msg);
        return result;
    }

    public isOK(): bool {
        return this._ok;
    }

    public isErr(): bool {
        return !this._ok;
    }

    public unwrap(): T {
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
        if (this._ok) {
            dev.abort('error must exist when calling err.');
        }
        return this._error;
    }

    public mapErr<K>(): Result<K> {
        if (this._ok) {
            dev.abort('error must exist when calling err.');
        }
        return new Result<K>(false, instantiateZero<K>(), this._error);
    }
}


export class Option<T> {
    protected _val: T;
    protected _isEmpty: bool

    protected constructor(contain: bool, val: T = instantiateZero<T>()) {
        this._isEmpty = contain;
        this._val = val;
    }

    public static some<T>(val: T): Option<T> {
        const result = new Option<T>(false, val);
        return result;
    }

    public static none<T>(): Option<T> {
        const result = new Option<T>(true, instantiateZero<T>());
        return result;
    }

    public isNone(): bool {
        return this._isEmpty;
    }

    public isSome(): bool {
        return !this._isEmpty;
    }

    public unwrap(): T {
        assert(!this._isEmpty, 'result must be ok when calling ok.');
        if (this._isEmpty) {
            unreachable();
        }
        return this._val;
    }
}

export class MaybeError extends Option<RuntimeError> {
    public static error(val: RuntimeError): MaybeError {
        const result = new MaybeError(true, val);
        return result;
    }

    public static ok(): MaybeError {
        const result = new MaybeError(false, new RuntimeError(''));
        return result;
    }

    public isErr(): bool {
        return !this._isEmpty;
    }

    public isOk(): bool {
        return this._isEmpty;
    }
}