export class Reader {
	_data: Uint8Array;
	_index: u32;
	_end: u32;

	constructor(data: Uint8Array) {
		this._data = data;
		this._index = 0;
		this._end = data.length;
	}

	public readU32(fieldNumber: u32): u32 {
		return 0;
	}

	readU64(fieldNumber: u32): u64 {
		return 0;
	}

	readI32(fieldNumber: u32): i32 {
		return 0;
	}

	readI64(fieldNumber: u32): i64 {
		return 0;
	}

	readBytes(fieldNumber: u32): Uint8Array {
		return new Uint8Array(0);
	}

	readString(fieldNumber: u32): string {
		return '';
	}

	readBoolean(fieldNumber: u32): boolean {
		return false;
	}

	readBytesArray(fieldNumber: u32): Uint8Array[] {
		return [];
	}

	readU32s(fieldNumber: u32): u32[] {
		return [];
	}

	readU64s(fieldNumber: u32): u64[] {
		return [];
	}

	readI32s(fieldNumber: u32): i32[] {
		return [];
	}

	readI64s(fieldNumber: u32): i64[] {
		return [];
	}

	readStrings(fieldNumber: u32): string[] {
		return [];
	}

	readBooleans(fieldNumber: u32): boolean[] {
		return [];
	}

}
