import * as types from "../type_def";
import * as dev from '../dev';
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

	public readU32(fieldNumber: u32): types.Result<u32> {
		const result = this._checkAndReadUint64(fieldNumber);
		if (result.isErr()) {
			return result.mapErr<u32>();
		}
		return types.Result.ok(u32(result.unwrap()));
	}

	readU64(fieldNumber: u32): types.Result<u64> {
		return this._checkAndReadUint64(fieldNumber);
	}

	readI32(fieldNumber: u32): types.Result<i32> {
		const result = this._checkAndReadInt64(fieldNumber);
		if (result.isErr()) {
			return result.mapErr<i32>();
		}
		return types.Result.ok(i32(result.unwrap()));
	}

	readI64(fieldNumber: u32): types.Result<i64> {
		return this._checkAndReadInt64(fieldNumber);
	}

	readBytes(fieldNumber: u32): types.Result<u8[]> {
		const checkResult = this._checkStrictFieldNumber(fieldNumber);
		if (checkResult.isErr()) {
			return checkResult.mapErr<u8[]>();
		}
		return this._readBytes();
	}

	readString(fieldNumber: u32): types.Result<string> {
		const checkResult = this._checkStrictFieldNumber(fieldNumber);
		if (checkResult.isErr()) {
			return checkResult.mapErr<string>();
		}
		return this._readString();
	}

	readBoolean(fieldNumber: u32): types.Result<bool> {
		const checkResult = this._checkStrictFieldNumber(fieldNumber);
		if (checkResult.isErr()) {
			return checkResult.mapErr<bool>();
		}
		return this._readBool();
	}

	readBytesArray(fieldNumber: u32): types.Result<u8[][]> {
		const result = new Array<u8[]>();
		while (this._index < this._end) {
			const checkResult = this._checkFieldNumber(fieldNumber);
			if (checkResult.isErr()) {
				return checkResult.mapErr<u8[][]>();
			}
			if (!checkResult.unwrap()) {
				return types.Result.ok(result);
			}
			const valResult = this._readBytes();
			if (valResult.isErr()) {
				return valResult.mapErr<u8[][]>();
			}
			result.push(valResult.unwrap());
		}
		return types.Result.ok(result);
	}

	readU32s(fieldNumber: u32): types.Result<u32[]> {
		const checkResult = this._checkFieldNumber(fieldNumber);
		if (checkResult.isErr()) {
			return checkResult.mapErr<u32[]>();
		}
		if (!checkResult.unwrap()) {
			return types.Result.ok([]);
		}
		const arrayLength = this._readUint();
		if (arrayLength.isErr()) {
			return arrayLength.mapErr<u32[]>();
		}
		const end = this._index + u32(arrayLength.unwrap());
		const result = new Array<u32>();
		while (this._index < end) {
			const val = this._readUint();
			if (val.isErr()) {
				return val.mapErr<u32[]>();
			}
			result.push(u32(val.unwrap()));
		}
		return types.Result.ok(result);
	}

	readU64s(fieldNumber: u32): types.Result<u64[]> {
		const checkResult = this._checkFieldNumber(fieldNumber);
		if (checkResult.isErr()) {
			return checkResult.mapErr<u64[]>();
		}
		if (!checkResult.unwrap()) {
			return types.Result.ok([]);
		}
		const arrayLength = this._readUint();
		if (arrayLength.isErr()) {
			return arrayLength.mapErr<u64[]>();
		}
		const end = this._index + u32(arrayLength.unwrap());
		const result = new Array<u64>();
		while (this._index < end) {
			const val = this._readUint();
			if (val.isErr()) {
				return val.mapErr<u64[]>();
			}
			result.push(val.unwrap());
		}
		return types.Result.ok(result);
	}

	readI32s(fieldNumber: u32): types.Result<i32[]> {
		const checkResult = this._checkFieldNumber(fieldNumber);
		if (checkResult.isErr()) {
			return checkResult.mapErr<i32[]>();
		}
		if (!checkResult.unwrap()) {
			return types.Result.ok([]);
		}
		const arrayLength = this._readUint();
		if (arrayLength.isErr()) {
			return arrayLength.mapErr<i32[]>();
		}
		const end = this._index + u32(arrayLength.unwrap());
		const result = new Array<i32>();
		while (this._index < end) {
			const val = this._readInt();
			if (val.isErr()) {
				return val.mapErr<i32[]>();
			}
			result.push(i32(val.unwrap()));
		}
		return types.Result.ok(result);
	}

	readI64s(fieldNumber: u32): types.Result<i64[]> {
		const checkResult = this._checkFieldNumber(fieldNumber);
		if (checkResult.isErr()) {
			return checkResult.mapErr<i64[]>();
		}
		const check = checkResult.unwrap();
		if (!check) {
			return types.Result.ok([]);
		}
		const arrayLengthResult = this._readUint();
		if (arrayLengthResult.isErr()) {
			return arrayLengthResult.mapErr<i64[]>();
		}
		const arrayLength = arrayLengthResult.unwrap();
		const end = this._index + u32(arrayLength);
		const result = new Array<i64>();
		while (this._index < end) {
			const valResult = this._readInt();
			if (valResult.isErr()) {
				return valResult.mapErr<i64[]>();
			}
			result.push(valResult.unwrap());
		}
		return types.Result.ok(result);
	}

	readStrings(fieldNumber: u32): types.Result<string[]> {
		const result = new Array<string>();
		while (this._index < this._end) {
			const checkResult = this._checkFieldNumber(fieldNumber);
			if (checkResult.isErr()) {
				return checkResult.mapErr<string[]>();
			}
			const check = checkResult.unwrap();
			if (!check) {
				return types.Result.ok(result);
			}
			const val = this._readString();
			if (val.isErr()) {
				return val.mapErr<string[]>();
			}
			result.push(val.unwrap());
		}
		return types.Result.ok(result);
	}

	readBooleans(fieldNumber: u32): types.Result<bool[]> {
		const checkResult = this._checkFieldNumber(fieldNumber);
		if (checkResult.isErr()) {
			return checkResult.mapErr<bool[]>();
		}
		const check = checkResult.unwrap();
		if (!check) {
			return types.Result.ok([]);
		}
		const arrayLength = this._readUint();
		if (arrayLength.isErr()) {
			return arrayLength.mapErr<bool[]>();
		}
		const end = this._index + u32(arrayLength.unwrap());
		const result = new Array<bool>();
		while (this._index < end) {
			const val = this._readBool();
			if (val.isErr()) {
				return val.mapErr<bool[]>();
			}
			result.push(val.unwrap());
		}
		return types.Result.ok(result);
	}

	readDecodable<T extends EncodeDecoder>(fieldNumber: u32): types.Result<T> {
		const checkResult = this._checkStrictFieldNumber(fieldNumber);
		if (checkResult.isErr()) {
			return types.Result.err<T>(checkResult.err());
		}
		const objectBytes = this._readBytes();
		if (objectBytes.isErr()) {
			return types.Result.err<T>(objectBytes.err());
		}
		const i = instantiate<T>();

		i.decode(objectBytes.unwrap());
		return types.Result.ok(i);
	}

	readDecodables<T extends EncodeDecoder>(fieldNumber: u32): types.Result<T[]> {
		const result = new Array<T>();
		while (this._index < this._end) {
			const checkResult = this._checkFieldNumber(fieldNumber);
			if (checkResult.isErr()) {
				return types.Result.err<T[]>(checkResult.err());
			}
			const check = checkResult.unwrap();
			if (!check) {
				return types.Result.ok(result);
			}
			const objectBytes = this._readBytes();
			if (objectBytes.isErr()) {
				return types.Result.err<T[]>(objectBytes.err());
			}
			const i = instantiate<T>();
			i.decode(objectBytes.unwrap());
			result.push(i);
		}
		return types.Result.ok(result);
	}

	assertUnreadBytes(): types.Result<bool> {
		if (this._index != this._end) {
			return types.Result.err<bool>('Invalid input. there are remaining unread bytes.');
		}
		return types.Result.ok(true);
	}

	private _checkAndReadInt64(fieldNumber: u32): types.Result<i64> {
		const checkResult = this._checkStrictFieldNumber(fieldNumber);
		if (checkResult.isErr()) {
			return checkResult.mapErr<i64>();
		}
		return this._readInt();
	}

	private _checkAndReadUint64(fieldNumber: u32): types.Result<u64> {
		const checkResult = this._checkStrictFieldNumber(fieldNumber);
		if (checkResult.isErr()) {
			return checkResult.mapErr<u64>();
		}
		return this._readUint();
	}

	private _checkStrictFieldNumber(fieldNumber: u32): types.Result<bool> {
		const checkResult = this._checkFieldNumber(fieldNumber);
		if (checkResult.isErr()) {
			return checkResult.mapErr<bool>();
		}
		const check = checkResult.unwrap();
		if (!check) {
			return types.Result.err<bool>('Invalid fieldNumber: ' + fieldNumber.toString());
		}
		return checkResult;
	}

	private _checkFieldNumber(fieldNumber: u32): types.Result<bool> {
		if (this._index >= this._end) {
			return types.Result.ok(false);
		}
		const keyResult = readUInt(this._data, this._index);
		if (keyResult.isErr()) {
			return keyResult.mapErr<bool>();
		}
		const key = keyResult.unwrap();
		const nextFieldNumberResult = readKey(u32(key.value));
		if (nextFieldNumberResult.isErr()) {
			return nextFieldNumberResult.mapErr<bool>();
		}
		const nextFieldNumber = nextFieldNumberResult.unwrap();
		if (fieldNumber != nextFieldNumber.fieldNumber) {
			return types.Result.ok(false);
		}
		this._index += key.size;
		return types.Result.ok(true);
	}

	private _readUint(): types.Result<u64> {
		const result = readUInt(this._data, this._index);
		if (result.isErr()) {
			return result.mapErr<u64>();
		}
		this._index += result.unwrap().size;
		return types.Result.ok(result.unwrap().value);
	}

	private _readInt(): types.Result<i64> {
		const result = this._readUint();
		if (result.isErr()) {
			return result.mapErr<i64>();
		}
		const value = result.unwrap();
		if (value % 2 == 0) {
			return types.Result.ok(i64(value) / 2);
		}
		return types.Result.ok(-1 * i64((value + 1) / 2));
	}

	private _readBool(): types.Result<bool> {
		const target = this._data[this._index];
		if (target != 0 && target != 1) {
			return types.Result.err<bool>('Invalid binary data');
		}
		const result = target != 0;
		this._index++;
		return types.Result.ok(result)
	}

	private _readBytes(): types.Result<u8[]> {
		const sizeResult = this._readUint();
		if (sizeResult.isErr()) {
			return sizeResult.mapErr<u8[]>();
		}
		const size = u32(sizeResult.unwrap());
		const remaining = this._end - this._index;
		if (size > u64(remaining)) {
			return types.Result.err<u8[]>('Invalid byte size');
		}
		const result = this._data.slice(this._index, this._index + size);
		this._index += size;

		return types.Result.ok(result);
	}

	private _readString(): types.Result<string> {
		const rawBytesResult = this._readBytes();
		if (rawBytesResult.isErr()) {
			return rawBytesResult.mapErr<string>();
		}
		const rawBytes = rawBytesResult.unwrap();
		const typedBytes = new Uint8Array(rawBytes.length);
		typedBytes.set(rawBytes);

		return types.Result.ok(String.UTF8.decode(typedBytes.buffer, false));
	}
}
