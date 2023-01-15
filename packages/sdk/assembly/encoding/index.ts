export interface Decoder {
    decode(val: Uint8Array): void;
}

export interface Encoder {
    encode(): Uint8Array;
}

export { EncodeDecoder } from './codec';

export function u32ToBytesBE(num: u32): Uint8Array {
    const result = new Uint8Array(4);
    return result;
}

export function u64ToBytesBE(num: u64): Uint8Array {
    const result = new Uint8Array(4);
    return result;
}

export { Reader } from './reader';
export { Writer } from './writer';
