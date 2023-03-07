import { EncodeDecoder, readKey, readUInt } from "./codec";

export class Reader {
	_data: u8[];
	_index: u32;
	_end: u32;

	constructor(data: u8[]) {
		this._data = data;
		this._index = 0;
		this._end = data.length;
	}

	public readU32(fieldNumber: u32): u32 {
		const result = this._checkAndReadUint64(fieldNumber);
		return u32(result);
	}

	readU64(fieldNumber: u32): u64 {
		return this._checkAndReadUint64(fieldNumber);
	}

	readI32(fieldNumber: u32): i32 {
		const result = this._checkAndReadInt64(fieldNumber);
		return i32(result);
	}

	readI64(fieldNumber: u32): i64 {
		return this._checkAndReadInt64(fieldNumber);
	}

	readBytes(fieldNumber: u32): u8[] {
		if (!this._checkFieldNumber(fieldNumber)) {
			abort('Invalid fieldNumber: ' + fieldNumber.toString());
		}
		return this._readBytes();
	}

	readString(fieldNumber: u32): string {
		if (!this._checkFieldNumber(fieldNumber)) {
			abort('Invalid fieldNumber: ' + fieldNumber.toString());
		}
		return this._readString();
	}

	readBoolean(fieldNumber: u32): bool {
		if (!this._checkFieldNumber(fieldNumber)) {
			abort('Invalid fieldNumber: ' + fieldNumber.toString());
		}
		return this._readBool();
	}

	readBytesArray(fieldNumber: u32): u8[][] {
		const result = new Array<u8[]>();
		while (this._index < this._end) {
			if (!this._checkFieldNumber(fieldNumber)) {
				return result;
			}
			const val = this._readBytes();
			result.push(val);
		}
		return result;
	}

	readU32s(fieldNumber: u32): u32[] {
		if (!this._checkFieldNumber(fieldNumber)) {
			return [];
		}
		const arrayLength = this._readUint();
		const end = this._index + u32(arrayLength);
		const result = new Array<u32>();
		while (this._index < end) {
			const val = this._readUint();
			result.push(u32(val));
		}
		return result;
	}

	readU64s(fieldNumber: u32): u64[] {
		if (!this._checkFieldNumber(fieldNumber)) {
			return [];
		}
		const arrayLength = this._readUint();
		const end = this._index + u32(arrayLength);
		const result = new Array<u64>();
		while (this._index < end) {
			const val = this._readUint();
			result.push(val);
		}
		return result;
	}

	readI32s(fieldNumber: u32): i32[] {
		if (!this._checkFieldNumber(fieldNumber)) {
			return [];
		}
		const arrayLength = this._readUint();
		const end = this._index + u32(arrayLength);
		const result = new Array<i32>();
		while (this._index < end) {
			const val = this._readInt();
			result.push(i32(val));
		}
		return result;
	}

	readI64s(fieldNumber: u32): i64[] {
		if (!this._checkFieldNumber(fieldNumber)) {
			return [];
		}
		const arrayLength = this._readUint();
		const end = this._index + u32(arrayLength);
		const result = new Array<i32>();
		while (this._index < end) {
			const val = this._readInt();
			result.push(val);
		}
		return result;
	}

	readStrings(fieldNumber: u32): string[] {
		const result = new Array<string>();
		while (this._index < this._end) {
			if (!this._checkFieldNumber(fieldNumber)) {
				return result;
			}
			const val = this._readString();
			result.push(val);
		}
		return result;
	}

	readBooleans(fieldNumber: u32): bool[] {
		if (!this._checkFieldNumber(fieldNumber)) {
			return [];
		}
		const arrayLength = this._readUint();
		const end = this._index + u32(arrayLength);
		const result = new Array<bool>();
		while (this._index < end) {
			const val = this._readBool();
			result.push(val);
		}
		return result;
	}

	readDecodable<T extends EncodeDecoder>(fieldNumber: u32): T {
		if (!this._checkFieldNumber(fieldNumber)) {
			abort('Invalid fieldNumber: ' + fieldNumber.toString());
		}
		const objectBytes = this._readBytes();
		const i = instantiate<T>();

		i.decode(objectBytes);
		return i;
	}

	readDecodables<T extends EncodeDecoder>(fieldNumber: u32): T[] {
		const result = new Array<T>();
		while (this._index < this._end) {
			if (!this._checkFieldNumber(fieldNumber)) {
				return result;
			}
			const objectBytes = this._readBytes();
			const i = instantiate<T>();
			i.decode(objectBytes);
			result.push(i);
		}
		return result;
	}

	assertUnreadBytes(): void {
		if (this._index != this._end) {
			abort('Invalid input. there are remaining unread bytes.');
		}
	}

	private _checkAndReadInt64(fieldNumber: u32): i64 {
		const ok = this._checkFieldNumber(fieldNumber);
		if (!ok) {
			abort('Invalid field number');
		}
		return this._readInt();
	}

	private _checkAndReadUint64(fieldNumber: u32): u64 {
		const ok = this._checkFieldNumber(fieldNumber);
		if (!ok) {
			abort('Invalid field number');
		}
		return this._readUint();
	}

	private _checkFieldNumber(fieldNumber: u32): bool {
		if (this._index >= this._end) {
			return false;
		}
		const key = readUInt(this._data, this._index);
		const nextFieldNumber = readKey(u32(key.value));
		if (fieldNumber != nextFieldNumber.fieldNumber) {
			return false;
		}
		this._index += key.size;
		return true;
	}

	private _readUint(): u64 {
		const result = readUInt(this._data, this._index);
		this._index += result.size;
		return result.value;
	}

	private _readInt(): i64 {
		const result = this._readUint();
		if (result % 2 == 0) {
			return i64(result) / 2;
		}
		return -1 * i64((result + 1) / 2);
	}

	private _readBool(): bool {
		const target = this._data[this._index];
		if (target != 0 && target != 1) {
			abort('Invalid binary data');
		}
		const result = target != 0;
		this._index++;
		return result
	}

	private _readBytes(): u8[] {
		const size = u32(this._readUint());
		const remaining = this._end - this._index;
		if (size > u64(remaining)) {
			abort('Invalid byte size');
		}
		const result = this._data.slice(this._index, this._index + size);
		this._index += size;

		return result;
	}

	private _readString(): string {
		const rawBytes = this._readBytes();
		const typedBytes = new Uint8Array(rawBytes.length);
		typedBytes.set(rawBytes);

		return String.UTF8.decode(typedBytes.buffer, false);
	}
}
