import * as env from "../env";
import * as encoding from '../encoding';
import * as types from "../type_def";
import * as internal from "../internal";

export class BaseEvent extends encoding.EncodeDecoder {
	topics(): u8[][] {
		return [];
	}

	log(): void {
		env.event.log(internal.pointer.toZeroPtr(0))
	}

	error(): void {
		env.event.log(internal.pointer.toZeroPtr(0))
	}
}

@codec
export class Event extends encoding.EncodeDecoder {
	@fieldNumber(1)
	module: string = '';
	@fieldNumber(2)
	name: string = '';
	@fieldNumber(3)
	topics: u8[][] = [];
	@fieldNumber(4)
	data: u8[] = [];
	@fieldNumber(5)
	noRevert: bool = false;
}