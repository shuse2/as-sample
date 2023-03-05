import { ParsedData } from "./types";
import crypto from 'crypto';

function sha256(data: Buffer): Buffer {
	const dataHash = crypto.createHash('sha256');
	dataHash.update(data);

	return dataHash.digest();
};

function computeStorePrefix(name: string): Buffer {
	const prefix = sha256(Buffer.from(name, 'utf-8')).slice(0, 4);
	// eslint-disable-next-line no-bitwise
	prefix[0] &= 0x7f;
	return prefix;
};

function computeSubstorePrefix(index: number): Buffer {
	//  Converts input to binary, inverts binary string, and converts it to bytes
	const binaryIndex = `${'0'.repeat(16)}${index.toString(2)}`;
	const val = parseInt(
		binaryIndex
			.substring(binaryIndex.length - 16)
			.split('')
			.reverse()
			.join(''),
		2,
	);
	const result = Buffer.alloc(2);
	result.writeUint16BE(val);

	return result;
};

function getKey(value: string | number | undefined, modName: string, className: string): Buffer {
    if (!value) {
        const storePrefix = computeStorePrefix(modName);
        const substorePrefix = sha256(Buffer.from(className, 'utf-8')).subarray(0, 2);
        return Buffer.concat([storePrefix, substorePrefix]);
    }
    if (typeof value === 'number') {
        if (value < 0) {
            throw new Error('Invalid substore key. When number is specified, it must be 0 or greater.');
        }
        const storePrefix = computeStorePrefix(modName);
        const substorePrefix = computeSubstorePrefix(value);
        return Buffer.concat([storePrefix, substorePrefix]);
    }
    // 2 bytes hex means it only specify substore prefix
    if (value.length === 4) {
        const storePrefix = computeStorePrefix(modName);
        const substorePrefix = Buffer.from(value, 'hex');
        return Buffer.concat([storePrefix, substorePrefix]);
    }
    if (value.length === 12) {
        return Buffer.from(value, 'hex');
    }

    throw new Error(`Invalid input ${value} to generate store key`);
}


export function createStoreKey(data: ParsedData, modName: string): { code: string, key: string } {
    const decorator = data.decorators.find(d => d.name === 'store');
    if (!decorator) {
		throw new Error('data is not store');
	}
    if (decorator.value.length > 1) {
        throw new Error('Invalid decorator input for store');
    }
    const [value] = decorator.value;
    const key = getKey(value, modName, data.class);
    const stringKey = Uint8Array.from(key).toString()

    const code = `
    public key(): u8[] {
        return [${stringKey}];
    }
    `
    return {
        code,
        key: key.toString('hex'),
    };
}

export interface StoreMetadata {
    name: string;
    key: string;
    data: string;
}

export function getStoreMetadata(data: ParsedData, modName: string): StoreMetadata {
    const decorator = data.decorators.find(d => d.name === 'store');
    if (!decorator) {
		throw new Error('data is not store');
	}
    if (decorator.value.length > 1) {
        throw new Error('Invalid decorator input for store');
    }
    if (!data.extends || !data.extends.args.length) {
        throw new Error('Store must extend base class');
    }
    const [value] = decorator.value;
    const key = getKey(value, modName, data.class);

    return {
        name: data.class,
        key: key.toString('hex'),
        data: data.extends.args[0],
    }

}