import {Decorator, ParsedData} from "./types.js";
import {containsDecorator} from "./utils.js";

const convertKnownType = (type: string): string => {
	switch(type) {
		case 'types.Address':
			return 'Array<u8>';
		default:
			return type;
	}
};

const getArrayType = (type: string) => {
	let start = 0;
	let end = type.length - 1;
	for (let i = 0; i < type.length; i++) {
		if (start === 0 && type.at(i) === '<') {
			start = i + 1;
		}
		if (end === type.length - 1 && type.at(end - i) === '>') {
			end = type.length - 1 - i;
		}
	}
	return type.substring(start, end);
};

const getReader = (type: string, fieldNumber: number): string => {
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
		const objType = getArrayType(convertedType);
		return `reader.readDecodables<${objType}>(${fieldNumber})`;
	} else {
		return `reader.readDecodable<${convertedType}>(${fieldNumber})`;
	}
}

const getWriter = (type: string, fieldNumber: number, name: string): string => {
	const convertedType = convertKnownType(type);
	if (convertedType === 'u32') {
		return `writer.writeU32(${fieldNumber}, this.${name})`;
	}
	if (convertedType === 'Array<u32>') {
		return `writer.writeU32s(${fieldNumber}, this.${name})`;
	}
	if (convertedType === 'i32') {
		return `writer.writeI32(${fieldNumber}, this.${name})`;
	}
	if (convertedType === 'Array<i32>') {
		return `writer.writeI32s(${fieldNumber}, this.${name})`;
	}
	if (convertedType === 'u64') {
		return `writer.writeU64(${fieldNumber}, this.${name})`;
	}
	if (convertedType === 'Array<u64>') {
		return `writer.writeU64(${fieldNumber}, this.${name})`;
	}
	if (convertedType === 'i64') {
		return `writer.writeI64(${fieldNumber}, this.${name})`;
	}
	if (convertedType === 'Array<i64>') {
		return `writer.writeI64s(${fieldNumber}, this.${name})`;
	}
	if (convertedType === 'bool') {
		return `writer.writeBoolean(${fieldNumber}, this.${name})`;
	}
	if (convertedType === 'Array<bool>') {
		return `writer.writeBooleans(${fieldNumber}, this.${name})`;
	}
	if (convertedType === 'string') {
		return `writer.writeString(${fieldNumber}, this.${name})`;
	}
	if (convertedType === 'Array<string>') {
		return `writer.writeStrings(${fieldNumber}, this.${name})`;
	}
	if (convertedType === 'Array<u8>') {
		return `writer.writeBytes(${fieldNumber}, this.${name})`;
	}
	if (convertedType === 'Array<Array<u8>>') {
		return `writer.writeBytesArray(${fieldNumber}, this.${name})`;
	}
	if (convertedType.includes('Array')) {
		return `for (let i = 0; i < this.${name}.length; i++) { writer.writeEncodable(${fieldNumber}, this.${name}[i]); }`;
	} else {
		return `writer.writeEncodable(${fieldNumber}, this.${name})`;
	}
};

const getFieldNumber = (decorators: Decorator[]): number => {
	const d = decorators.find(d => d.name === 'fieldNumber');
	if (!d) {
		throw new Error('no decorator found.');
	}
	if (typeof d.value !== 'number') {
		throw new Error('invalid fieldNumber');
	}
	if (d.value <= 0) {
		throw new Error('invalid fieldNumber');
	}
	return d.value;
};

export function createCodec(data: ParsedData): ({ encode: string; decode: string }) {
	if (!data.decorators.some(d => d.name === 'codec')) {
		throw new Error('data is not codec');
	}
	const fields = data.fields.filter(d => containsDecorator(d.decorators, 'fieldNumber'));
	fields.sort((a, b) => {
		const d1 = a.decorators.find(d => d.name === 'fieldNumber')!;
		const d2 = b.decorators.find(d => d.name === 'fieldNumber')!;
		return Number(d1.value) - Number(d2.value);
	});
	let decode = `decode(val: u8[]): void { \nconst reader = new encoding.Reader(val);\n`;
	let encode = 'encode(): u8[] { \nconst writer = new encoding.Writer();\n';
	for (const field of fields) {
		decode += `this.${field.name} = ${getReader(field.type, getFieldNumber(field.decorators))};\n`;
		encode += `${getWriter(field.type, getFieldNumber(field.decorators), `${field.name}`)};\n`;
	}
	decode += 'reader.assertUnreadBytes(); }\n';
	encode += 'return writer.result(); }\n';
	decode += '}';
	return {
		encode,
		decode,
	};
};
