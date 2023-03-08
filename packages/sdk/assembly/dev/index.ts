import * as env from "../env";
import { pointer } from "../internal";


export function log(text: string): void {
    const val = String.UTF8.encode(text, false);
    const view = new DataView(val)

    const ptrSize = pointer.toPtrSize(u32(view.dataStart), val.byteLength);

    env.dev.log(ptrSize);
}

export function abort(reason: string): void {
    log(reason);
    unreachable();
}