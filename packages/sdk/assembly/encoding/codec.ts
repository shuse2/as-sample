import * as types from '../type_def';
export class EncodeDecoder {
	encode(): u8[] { return []; }
  decode(val: u8[]): types.Result<bool> { return types.Result.err<bool>('not implemented')}
}

export interface Decoder {
    decode(val: u8[]): void;
}

export interface Encoder {
    encode(): u8[];
}

const msg: u64 = 0x80;
const rest: u64 = 0x7f;
export const wireType0: u32 = 0;
export const wireType2: u32 = 2;

export class ValueWithSize<T> {
  constructor(public value: T, public size: u32) {}
}

class ProtoKey {
  constructor(public fieldNumber: u32, public wireType: u32) {}
}

export function readUInt(buffer: u8[], offset: i32): types.Result<ValueWithSize<u64>> {
  let result: u64 = 0;
  let index = offset;
  for (let shift = 0; shift < 64; shift += 7) {
    if (index > buffer.length) {
      return types.Result.err<ValueWithSize<u64>>('Invalid buffer length');
    }
    const byte = buffer.at(index);
    index += 1;
    if (index == offset + 10 && byte > 0x01) {
      return types.Result.err<ValueWithSize<u64>>('Value out of range of uint64');
    }
    result |= (byte & rest) << shift;
    if ((byte & msg) === 0) {
      return types.Result.ok<ValueWithSize<u64>>(new ValueWithSize(result, index - offset));
    }
  }
  return types.Result.err<ValueWithSize<u64>>('Termination bit not found');
}

export function writeVarint(intVal: u64): u8[] {
  const result: u8[] = [];
  let value = intVal;
  while( value > rest) {
    const byte = msg | ((value & rest) >>> 0);
    result.push(u8(byte));
		value = (value >>> 7) >>> 0;
  }
  result.push(u8(value));

  return result;
}

// returns field number, wire type, and error from the key.
export function readKey(val: u32): types.Result<ProtoKey> {
	const wireType = val & 7;
  if (wireType != wireType0 && wireType != wireType2) {
    return types.Result.err<ProtoKey>('Invalid wire type');
  }
	const fieldNumber = val >> 3;

  return types.Result.ok(new ProtoKey(fieldNumber, wireType));
}

export function getKey(wireType: u32, fieldNumber: u32): ValueWithSize<u8[]> {
	const key = (fieldNumber << 3) | wireType;
  const varint = writeVarint(key);
  return new ValueWithSize(varint, varint.length);
}