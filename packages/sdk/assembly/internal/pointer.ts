export function getPtr(ptrSize: u64): u32 {
    return u32(ptrSize);
}

export function getSize(ptrSize: u64): i32 {
    const size = ptrSize >> 32;
    return i32(size);
}

export function toPtrSize(ptr: u32, size: u32): u64 {
    const shiftedPtr: u64 = (u64(size) << 32) + ptr;
    return shiftedPtr;
}

export function toZeroPtr(ptr: i64): u64 {
    return ptr << 32;
}