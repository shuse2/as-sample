export class EncodeDecoder {
	encode(): u8[] { return []; }
  decode(val: u8[]): void {}
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

export function readUInt(buffer: u8[], offset: i32): ValueWithSize<u64> {
  let result: u64 = 0;
  let index = offset;
  for (let shift = 0; shift < 64; shift += 7) {
    if (index > buffer.length) {
      abort('Invalid buffer length');
    }
    const byte = buffer.at(index);
    index += 1;
    if (index == offset + 10 && byte > 0x01) {
      abort('Value out of range of uint64');
    }
    result |= (byte & rest) << shift;
		if ((byte & msg) === 0) {
			return new ValueWithSize(result, index-offset);
		}
  }
  abort('Termination bit not found');
  return new ValueWithSize(0, 0);
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
export function readKey(val: u32): ProtoKey {
	const wireType = val & 7;
	if (wireType != wireType0 && wireType != wireType2) {
    abort("Invalid wire type");
	}
	const fieldNumber = val >> 3;

	return new ProtoKey(fieldNumber, wireType);
}

export function getKey(wireType: u32, fieldNumber: u32): ValueWithSize<u8[]> {
	const key = (fieldNumber << 3) | wireType;
  const varint = writeVarint(key);
  return new ValueWithSize(varint, varint.length);
}