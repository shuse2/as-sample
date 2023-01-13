// The entry file of your WebAssembly module.

import { types, encoding, env, framework } from "lisk-sdk/assembly";
import { verify as transfer_verify , execute as transfer_execute } from './commands/transfer';
import { TokenModule } from './module';

export function add(a: i32, b: i32): i32 {
  return a + b;
}

export function init(): types.Status {
  return types.Status.Ok;
}

export function beforeCommandExecute(): types.Status {
  const res = encoding.u32ToBytesBE(30);
  console.log(res.toString());
  env.storage.get(res);
  return types.Status.Ok;
}

export function afterCommandExecute(): types.Status {
  return types.Status.Ok;
}

export function beforeTransactionsExecute(): types.Status {
  return types.Status.Ok;
}

export function afterTransactionsExecute(): types.Status {
  return types.Status.Ok;
}

export {
  transfer_verify,
  transfer_execute,
}

const tokenModule = new TokenModule();

framework.app.register(tokenModule);

export function execute(): void {
	framework.app.execute();
}
