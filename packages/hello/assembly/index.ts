// The entry file of your WebAssembly module.

import { types, encoding, env } from "lisk-sdk/assembly";

export function add(a: i32, b: i32): i32 {
  return a + b;
}

export function init(): types.Result {
  return types.Result.Ok;
}

export function beforeCommandExecute(): types.Result {
  const res = encoding.u32ToBytesBE(30);
  console.log(res.toString());
  env.storage.get(res);
  return types.Result.Ok;
}

export function afterCommandExecute(): types.Result {
  return types.Result.Ok;
}

export function beforeTransactionsExecute(): types.Result {
  return types.Result.Ok;
}

export function afterTransactionsExecute(): types.Result {
  return types.Result.Ok;
}
