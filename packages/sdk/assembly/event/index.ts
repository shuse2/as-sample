import * as env from "../env";
import { Encoder } from '../encoding';

export function log<T, K>(topics: Uint8Array[], val: Encoder): void {
    const encodedArg = val.encode();
    env.event.log(topics, encodedArg);
}
