// @ts-ignore
@external("env", "storage.get")
export declare function get(key: i64): i64;

// @ts-ignore
@external("env", "storage.set")
export declare function set(key: i64, value: i64): void;

// @ts-ignore
@external("env", "storage.del")
export declare function del(key: i64): void;
