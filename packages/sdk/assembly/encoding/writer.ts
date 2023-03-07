import { EncodeDecoder, getKey, wireType0, wireType2, writeVarint } from "./codec";

export class Writer {
	_result: u8[];
	_size: u32;

	constructor() {
		this._result = [];
		this._size = 0;
	}

	writeU32(fieldNumber: u32, data: u32): void {
		this._writeKey(wireType0, fieldNumber);
		this._writeUint(u64(data));
	}

	writeU64(fieldNumber: u32, data: u64): void {
		this._writeKey(wireType0, fieldNumber);
		this._writeUint(data);
	}

	writeI32(fieldNumber: u32, data: i32): void {
		this._writeKey(wireType0, fieldNumber);
		this._writeInt(i64(data));
	}

	writeI64(fieldNumber: u32, data: i64): void {
		this._writeKey(wireType0, fieldNumber);
		this._writeInt(data);
	}

	writeBytes(fieldNumber: u32, data: u8[]): void {
		this._writeKey(wireType2, fieldNumber);
		this._writeBytes(data);
	}

	writeString(fieldNumber: u32, data: string): void {
		this._writeKey(wireType2, fieldNumber);

		const encodedStr = String.UTF8.encode(data);
		const view = new DataView(encodedStr)
		const strBytes = new Array<u8>(view.byteLength);
		for (let i = 0; i < view.byteLength; i++) {
			strBytes[i] = view.getUint8(i);
		}

		this._writeBytes(strBytes);
	}

	writeBoolean(fieldNumber: u32, data: bool): void {
		this._writeKey(wireType0, fieldNumber);
		this._writeBool(data);
	}

	writeEncodable(fieldNumber: u32, data: EncodeDecoder): void {
		this._writeKey(wireType2, fieldNumber);
		const encoded = data.encode();
		this._writeBytes(encoded);
	}

	writeBytesArray(fieldNumber: u32, data: u8[][]): void {
		if (data.length == 0) {
			return;
		}
		for (let i = 0; i < data.length; i++) {
			this.writeBytes(fieldNumber, data[i]);
		}
	}

	writeU32s(fieldNumber: u32, data: u32[]): void {
		if (data.length == 0) {
			return
		}
		this._writeKey(wireType2, fieldNumber);

		const writer = new Writer();
		for (let i = 0; i < data.length; i++) {
			writer._writeUint(u64(data[i]));
		}

		this._writeBytes(writer.result());
	}

	writeU64s(fieldNumber: u32, data: u64[]): void {
		if (data.length == 0) {
			return
		}
		this._writeKey(wireType2, fieldNumber);

		const writer = new Writer();
		for (let i = 0; i < data.length; i++) {
			writer._writeUint(data[i]);
		}

		this._writeBytes(writer.result());
	}

	writeI32s(fieldNumber: u32, data: i32[]): void {
		if (data.length == 0) {
			return
		}
		this._writeKey(wireType2, fieldNumber);

		const writer = new Writer();
		for (let i = 0; i < data.length; i++) {
			writer._writeInt(i64(data[i]));
		}

		this._writeBytes(writer.result());
	}

	writeI64s(fieldNumber: u32, data: i64[]): void {
		if (data.length == 0) {
			return
		}
		this._writeKey(wireType2, fieldNumber);

		const writer = new Writer();
		for (let i = 0; i < data.length; i++) {
			writer._writeInt(data[i]);
		}

		this._writeBytes(writer.result());
	}

	writeStrings(fieldNumber: u32, data: string[]): void {
		if (data.length == 0) {
			return;
		}
		for (let i = 0; i < data.length; i++) {
			this.writeString(fieldNumber, data[i]);
		}
	}

	writeBools(fieldNumber: u32, data: boolean[]): void {
		if (data.length == 0) {
			return
		}
		this._writeKey(wireType2, fieldNumber);

		const writer = new Writer();
		for (let i = 0; i < data.length; i++) {
			writer._writeBool(data[i]);
		}

		this._writeBytes(writer.result());
	}

	result(): u8[] {
		const result = new Array<u8>(this._result.length);
		for (let i = 0; i < this._result.length; i++) {
			result[i] = this._result[i];
		}
		return result;
	}

	private _writeBytes(data: u8[]): void {
		const varint = writeVarint(data.length);
		this._result = this._result.concat(varint);
		this._size += varint.length;
		this._result = this._result.concat(data);
	}

	private _writeInt(data: i64): void {
		if (data >= 0) {
			this._writeUint(2 * u64(data));
			return;
		}
		this._writeUint(u64(-2 * i64(data) - 1));
	}

	private _writeUint(data: u64): void {
		const varint = writeVarint(data);
		this._result = this._result.concat(varint);
		this._size += varint.length;
	}

	private _writeBool(data: bool): void {
		const byte = new Array<u8>(1);
		if (data) {
			byte[0] = 1;
		} else {
			byte[0] = 0;
		}
		this._result = this._result.concat(byte);
		this._size++;
	}

	private _writeKey(wireType: u32, fieldNumber: u32): void {
		const key = getKey(wireType, fieldNumber);
		this._result = this._result.concat(key.value);
		this._size += key.size;
	}
}
