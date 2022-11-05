import * as env from "../env";
import { Decoder, Encoder } from '../encoding';

export function invoke<T, K>(module: string, method: string, val: Encoder<T>, decoder: Decoder<K>): K {
    const encodedArg = val.encode();
    const resp = env.channel.invoke(module, method, encodedArg);
    return decoder.decode(resp);
}
