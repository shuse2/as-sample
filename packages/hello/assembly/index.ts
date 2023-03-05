// The entry file of your WebAssembly module.

import { framework, bytes, storage } from "lisk-sdk/assembly";
import { NFTModule } from './nft/module';
import { AccountStore, Account } from "./nft/stores/account";

const nftModule = new NFTModule();

framework.app.register(nftModule);

export function execute(ptr_start: u32, data_len: u32): void {
	framework.app.execute(ptr_start, data_len);
}

export function debug(): void {
	const store = new AccountStore();
	const val = store.get([1,2,3]);
	console.log('balance' + val.balance.toString());
	const key: u8[] = [1,2,3];

	const acct = new Account();
	acct.balance = 999;

	store.set(key, acct);
	// const key2: u8[] = [1,2,3];
	const map = new bytes.ByteMap<bool>();
	map.set(bytes.fromArray(key), true);
	// console.log(map.has(bytes.fromArray(key)).toString());
	// console.log(map.has(bytes.fromArray(key2)).toString());
	// console.log(map.has(new Uint8Array(20).fill(255)).toString());

}

export function alloc(size: u32): usize {
	return heap.alloc(size);
} 

export function free(ptr: u32): void {
	heap.free(ptr);
}

export function realloc(ptr: u32, size: u32): u32 {
	return heap.realloc(ptr, size) as u32;
}