// @ts-ignore
@external("env", "storage.get")
export declare function get(key: Uint8Array): Uint8Array;

// @ts-ignore
@external("env", "storage.set")
export declare function set(key: Uint8Array, value: Uint8Array): void;

// @ts-ignore
@external("env", "storage.del")
export declare function del(key: Uint8Array): void;