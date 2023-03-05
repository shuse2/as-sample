// @ts-ignore
@external("env", "storage.get")
export declare function get(key: i64): i64;

// @ts-ignore
@external("env", "storage.set")
export declare function set(key: i64, value: i64): void;

// @ts-ignore
@external("env", "storage.del")
export declare function del(key: i64): void;

export function getPtr(ptrSize: i64): u32 {
    const ptr = ptrSize >> 4;
    return u32(ptr);
}

export function getSize(ptrSize: i64): u32 {
    return u32(ptrSize);
}

export function toPtrSize(ptr: u32, size: u32): i64 {
    const shiftedPtr: i64 = (i64(ptr) << 4) + size;
    return shiftedPtr;
}