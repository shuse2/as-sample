import {Decorator, ParsedData} from "./types.js";
import {containsDecorator, getGenericType} from "./utils.js";

const convertKnownType = (type: string): string => {
	switch(type) {
		case 'types.Address':
		case 'types.ID':
			return 'Array<u8>';
		case 'framework.TransactionVerifyResult':
		case 'framework.TransactionExecuteResult':
			return 'i32';
		default:
			return type;
	}
};

export const getReader = (type: string, fieldNumber: number): string => {
	const convertedType = convertKnownType(type);
	if (convertedType === 'u32') {
		return `reader.readU32(${fieldNumber})`;
	}
	if (convertedType === 'Array<u32>') {
		return `reader.readU32s(${fieldNumber})`;
	}
	if (convertedType === 'i32') {
		return `reader.readI32(${fieldNumber})`;
	}
	if (convertedType === 'Array<i32>') {
		return `reader.readI32s(${fieldNumber})`;
	}
	if (convertedType === 'u64') {
		return `reader.readU64(${fieldNumber})`;
	}
	if (convertedType === 'Array<u64>') {
		return `reader.readU64s(${fieldNumber})`;
	}
	if (convertedType === 'Array<i64>') {
		return `reader.readI64s(${fieldNumber})`;
	}
	if (convertedType === 'string') {
		return `reader.readString(${fieldNumber})`;
	}
	if (convertedType === 'Array<string>') {
		return `reader.readStrings(${fieldNumber})`;
	}
	if (convertedType === 'bool') {
		return `reader.readBoolean(${fieldNumber})`;
	}
	if (convertedType === 'Array<bool>') {
		return `reader.readBooleans(${fieldNumber})`;
	}
	if (convertedType === 'Array<u8>') {
		return `reader.readBytes(${fieldNumber})`;
	}
	if (convertedType === 'Array<Array<u8>>') {
		return `reader.readBytesArray(${fieldNumber})`;
	}
	if (convertedType.includes('Array')) {
		const objType = getGenericType(convertedType);
		return `reader.readDecodables<${objType}>(${fieldNumber})`;
	} else {
		return `reader.readDecodable<${convertedType}>(${fieldNumber})`;
	}
}

export const getWriter = (type: string, fieldNumber: number, name: string): string => {
	const convertedType = convertKnownType(type);
	if (convertedType === 'u32') {
		return `writer.writeU32(${fieldNumber}, ${name})`;
	}
	if (convertedType === 'Array<u32>') {
		return `writer.writeU32s(${fieldNumber},${name})`;
	}
	if (convertedType === 'i32') {
		return `writer.writeI32(${fieldNumber}, ${name})`;
	}
	if (convertedType === 'Array<i32>') {
		return `writer.writeI32s(${fieldNumber}, ${name})`;
	}
	if (convertedType === 'u64') {
		return `writer.writeU64(${fieldNumber}, ${name})`;
	}
	if (convertedType === 'Array<u64>') {
		return `writer.writeU64(${fieldNumber}, ${name})`;
	}
	if (convertedType === 'i64') {
		return `writer.writeI64(${fieldNumber}, ${name})`;
	}
	if (convertedType === 'Array<i64>') {
		return `writer.writeI64s(${fieldNumber}, ${name})`;
	}
	if (convertedType === 'bool') {
		return `writer.writeBoolean(${fieldNumber}, ${name})`;
	}
	if (convertedType === 'Array<bool>') {
		return `writer.writeBooleans(${fieldNumber}, ${name})`;
	}
	if (convertedType === 'string') {
		return `writer.writeString(${fieldNumber}, ${name})`;
	}
	if (convertedType === 'Array<string>') {
		return `writer.writeStrings(${fieldNumber}, ${name})`;
	}
	if (convertedType === 'Array<u8>') {
		return `writer.writeBytes(${fieldNumber}, ${name})`;
	}
	if (convertedType === 'Array<Array<u8>>') {
		return `writer.writeBytesArray(${fieldNumber}, ${name})`;
	}
	if (convertedType.includes('Array')) {
		return `for (let i = 0; i < ${name}.length; i++) { writer.writeEncodable(${fieldNumber}, ${name}[i]); }`;
	} else {
		return `writer.writeEncodable(${fieldNumber}, ${name})`;
	}
};

const getFieldNumber = (decorators: Decorator[]): number => {
	const d = decorators.find(d => d.name === 'fieldNumber');
	if (!d) {
		throw new Error('no decorator found.');
	}
	if (d.value.length !== 1) {
		throw new Error('Invalid field number input.');
	}
	const value = Number(d.value[0]);
	if (typeof value !== 'number') {
		throw new Error('invalid fieldNumber');
	}
	if (value <= 0) {
		throw new Error('invalid fieldNumber');
	}
	return value;
};

export function createCodec(data: ParsedData): ({ encode: string; decode: string }) {
	if (!data.decorators.some(d => d.name === 'codec')) {
		throw new Error('data is not codec');
	}
	const fields = data.fields.filter(d => containsDecorator(d.decorators, 'fieldNumber'));
	fields.sort((a, b) => {
		const d1 = a.decorators.find(d => d.name === 'fieldNumber')!;
		const d2 = b.decorators.find(d => d.name === 'fieldNumber')!;
		return Number(d1.value[0]) - Number(d2.value[0]);
	});
	let decode = `decode(val: u8[]): types.Result<bool> { \nconst reader = new encoding.Reader(val);\n`;
	let encode = 'encode(): u8[] { \nconst writer = new encoding.Writer();\n';
	for (const field of fields) {
		// decode += `this.${field.name} = ${getReader(field.type, getFieldNumber(field.decorators))};\n`;
		decode += `
		{
			const readResult = ${getReader(field.type, getFieldNumber(field.decorators))};
			if (readResult.isErr()) {
				return readResult.mapErr<bool>();
			}
			this.${field.name} = readResult.ok();
		}
		`;
		encode += `${getWriter(field.type, getFieldNumber(field.decorators), `this.${field.name}`)};\n`;
	}
	decode += 'return reader.assertUnreadBytes(); }\n';
	encode += 'return writer.result(); }\n';
	decode += '}';
	return {
		encode,
		decode,
	};
};

export interface CodecMetadata {
	name: string;
	properties: {
		name: string;
		type: string;
		fieldNumber: number;
	}[];

}

export function getCodecMetadata(data: ParsedData): CodecMetadata {
	const fields = data.fields.filter(d => containsDecorator(d.decorators, 'fieldNumber'));
	fields.sort((a, b) => {
		const d1 = a.decorators.find(d => d.name === 'fieldNumber')!;
		const d2 = b.decorators.find(d => d.name === 'fieldNumber')!;
		return Number(d1.value[0]) - Number(d2.value[0]);
	});
	return {
		name: data.class,
		properties: fields.map(f => ({
			name: f.name,
			type: f.type,
			fieldNumber: getFieldNumber(f.decorators),
		})),
	};
}