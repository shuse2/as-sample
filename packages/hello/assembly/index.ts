// The entry file of your WebAssembly module.

import { framework, bytes, dev } from "lisk-sdk/assembly";
import { NFTModule } from './nft/module';
import { AccountStore, Account } from "./nft/stores/account";

const nftModule = new NFTModule();

framework.app.register(nftModule);

export function debug(): void {
	const store = new AccountStore();
	const acct = new Account();
	acct.balance = 999;

	const key: u8[] = [1,2,3];

	store.set(key, acct);

	const val = store.get([1,2,3]);
	dev.log('balance: ' + val.balance.toString());

	// const key2: u8[] = [1,2,3];
	const map = new bytes.ByteMap<bool>();
	map.set(bytes.fromArray(key), true);
	// console.log(map.has(bytes.fromArray(key)).toString());
	// console.log(map.has(bytes.fromArray(key2)).toString());
	// console.log(map.has(new Uint8Array(20).fill(255)).toString());

}

export function execute(input: u64, output: u64): u64 {
	return framework.app.execute(input, output);
}
