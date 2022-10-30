@external("env", "storage.get")
export declare function get(key: Uint8Array): Uint8Array;

@external("env", "storage.set")
export declare function set(key: Uint8Array, value: Uint8Array): void;

@external("env", "storage.del")
export declare function del(key: Uint8Array): void;