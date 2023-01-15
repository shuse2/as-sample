// The entry file of your WebAssembly module.

import { framework } from "lisk-sdk/assembly";
import { TokenModule } from './module';

const tokenModule = new TokenModule();

framework.app.register(tokenModule);

export function execute(): void {
	framework.app.execute();
}
