import { getReader, getWriter } from "./codec.js";
import { Method, ParsedData } from "./types.js";
import { containsDecorator } from "./utils.js";

function createReader(params: Method['params']): string {
    return `
        const reader = new encoding.Reader(params);
        ${params.map((param, i)=> `const v${i} = ${getReader(param.type, i)};\n`).join('')}
        reader.assertUnreadBytes();
    `;
}

function createWriter(name: string, params: Method['params'], returnType: string): string {
    if (returnType === 'void') {
        return `
            this.${name}(context, ${params.map((_, i) => `v${i}`).join(',')});
            return [];
        `;
    }
    return `
        const writer = new encoding.Writer();
        const result = this.${name}(context, ${params.map((_, i) => `v${i}`).join(',')});
        ${getWriter(returnType, 1, 'result')}
        return writer.result();
    `;
}

function createMethod(name: string, params: Method['params'], returnType: string): string {
    return `
    if (method == '${name}') {
        ${createReader(params)}
        ${createWriter(name, params, returnType)}
    }
    `;
}

export function createCommand(data: ParsedData): string {
    const callables = data.methods.filter(method => containsDecorator(method.decorators, 'command'));
    let result = `public call(context: framework.CommandContext, method: string, params: u8[]): u8[] {\n`;

    if (callables.length === 0) {
        result += `abort("unknown method: "+method); return [];\n }\n`;
        return result;
    }

    for (const callable of callables) {
        if (callable.params.length === 0 || callable.params[0].type !== 'framework.CommandContext') {
            throw new Error('Invalid parameter for command. First parameter must be framework.CommandContext');
        }
        result += createMethod(callable.name, callable.params.slice(1), callable.returnType);
    }
    result += ``;
    result += `abort("unknown method: "+method); return [];\n }\n`;
    return result;
}

export function createView(data: ParsedData): string {
    const callables = data.methods.filter(method => containsDecorator(method.decorators, 'view'));
    let result = `public view(method: string, params: u8[]): u8[] {\n`;

    if (callables.length === 0) {
        result += `abort("unknown method: "+method); return [];\n }\n`;
        return result;
    }

    for (const callable of callables) {
        result += createMethod(callable.name, callable.params, callable.returnType);
    }
    result += ``;
    result += `abort("unknown method: "+method); return [];\n }\n`;
    return result;
}

export interface MethodMetadata {
    name: string;
    params: {
        name: string;
        type: string;
        fieldNumber: number;
    }[];
    returnType: string;
}

export function getCommandMetadata(data: ParsedData): MethodMetadata[] {
    const callables = data.methods.filter(method => containsDecorator(method.decorators, 'command'));
    return callables.map(c => ({
        name: c.name,
        params: c.params.slice(1).map((p, i) => ({
            name: p.name,
            type: p.type,
            fieldNumber: i + 1,
        })),
        returnType: c.returnType,
    }));
}

export function getViewMetadata(data: ParsedData): MethodMetadata[] {
    const callables = data.methods.filter(method => containsDecorator(method.decorators, 'view'));
    return callables.map(c => ({
        name: c.name,
        params: c.params.map((p, i) => ({
            name: p.name,
            type: p.type,
            fieldNumber: i+ 1,
        })),
        returnType: c.returnType,
    }));
}