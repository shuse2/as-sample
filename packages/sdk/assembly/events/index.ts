import * as env from "../env";
import { Encoder, EncodeDecoder } from '../encoding';

export function log<T, K>(topics: u8[][], val: Encoder): void {
    const encodedArg = val.encode();
    env.event.log(topics, encodedArg);
}

export class BaseEvent extends EncodeDecoder {
	topics(): u8[][] {
		return [];
	}

	log(): void {
		env.event.log(this.topics(), this.encode())
	}

	error(): void {
		env.event.log(this.topics(), this.encode())
	}
}
