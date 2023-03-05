export function equal(v1: Uint8Array, v2: Uint8Array): bool {
    if (v1.length !== v2.length) {
        return false;
    }
    for (let i = 0; i < v1.length; i++) {
        if (v1.at(i) != v2.at(i)) {
            return false;
        }
    }
    return true;
}

export function sort(values: Uint8Array[]): void {
    values.sort((a, b) => a.length - b.length );
}

export function fromArray(value: u8[]): Uint8Array {
    const result = new Uint8Array(value.length);
    result.set(value);
    return result;
} 

export function toArray(value: Uint8Array): u8[] {
    const result = new Array<u8>(value.length);
    value.copyWithin(result.dataStart, 0);
    return result;
}

export class ByteMap<T> {
    private _pairs: Map<string, T> = new Map();

    set(key: Uint8Array, value: T): void {
        this._pairs.set(String.UTF8.decode(key.buffer), value);
    }

    has(key: Uint8Array): bool {
        return this._pairs.has(String.UTF8.decode(key.buffer));
    }

    get(key: Uint8Array): T {
        return this._pairs.get(String.UTF8.decode(key.buffer))
    }

    del(key: Uint8Array): bool {
        return this._pairs.delete(String.UTF8.decode(key.buffer))
    }
}