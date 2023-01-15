// The entry file of your WebAssembly module.

import { framework } from "lisk-sdk/assembly";
import { NFTModule } from './nft/module';

const nftModule = new NFTModule();

framework.app.register(nftModule);

export function execute(): void {
	framework.app.execute();
}
