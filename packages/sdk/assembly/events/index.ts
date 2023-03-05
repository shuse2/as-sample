import * as env from "../env";
import * as encoding from '../encoding';

export class BaseEvent extends encoding.EncodeDecoder {
	topics(): u8[][] {
		return [];
	}

	log(): void {
		env.event.log([])
	}

	error(): void {
		env.event.log([])
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