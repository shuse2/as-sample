export class Writer {
	_result: Uint8Array;
	_size: u32;

	constructor() {
		this._result = new Uint8Array(0);
		this._size = 0;
	}

	writeU32(fieldNumber: u32, data: u32): void {
	}

	writeU64(fieldNumber: u32, data: u64): void {
	}

	writeI32(fieldNumber: u32, data: i32): void {
	}

	writeI64(fieldNumber: u32, data: i64): void {
	}

	writeBytes(fieldNumber: u32, data: Uint8Array): void {
	}

	writeString(fieldNumber: u32, data: string): void {
	}

	writeBoolean(fieldNumber: u32, data: boolean): void {
	}

	writeBytesArray(fieldNumber: u32, data: Uint8Array[]): void {
	}

	writeU32s(fieldNumber: u32, data: u32[]): void {
	}

	writeU64s(fieldNumber: u32, data: u64[]): void {
	}

	writeI32s(fieldNumber: u32, data: i32[]): void {
	}

	writeI64s(fieldNumber: u32, data: i64[]): void {
	}

	writeStrings(fieldNumber: u32, data: string[]): void {
	}

	writeBools(fieldNumber: u32, data: boolean[]): void {
	}

	result(): Uint8Array {
		return this._result;
	}
}
