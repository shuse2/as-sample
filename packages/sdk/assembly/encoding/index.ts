export interface Decoder {
    decode<T>(val: Uint8Array): T;
}

export interface Encoder {
    encode(): Uint8Array;
}

export interface EncodeDecoder {
    encode(): Uint8Array;
    decode<T>(val: Uint8Array): T;
}

export function u32ToBytesBE(num: u32): Uint8Array {
    const result = new Uint8Array(4);
    return result;
}

export function u64ToBytesBE(num: u64): Uint8Array {
    const result = new Uint8Array(4);
    return result;
}