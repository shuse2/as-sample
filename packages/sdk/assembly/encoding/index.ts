export { EncodeDecoder, Decoder, Encoder } from './codec';

export function u32ToBytesBE(num: u32): u8[] {
    const result = new Array<u8>(4);
    return result;
}

export function u64ToBytesBE(num: u64): u8[] {
    const result = new Array<u8>(4);
    return result;
}

export { Reader } from './reader';
export { Writer } from './writer';
