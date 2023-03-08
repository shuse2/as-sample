import { getReader, getWriter } from "./codec.js";
import { Method, ParsedData } from "./types.js";
import { containsDecorator, getGenericType } from "./utils.js";

function createViewWriter(name: string, params: Method['params'], returnType: string): string {
    if (returnType === 'void') {
        return `
            this.${name}(${params.map((_, i) => `v${i}`).join(',')});
            return types.Result.ok([]);
        `;
    }
    if (returnType.includes('types.Result')) {
        const internalType = getGenericType(returnType);
        return `
        const writer = new encoding.Writer();
        const result = this.${name}(${params.map((_, i) => `v${i}`).join(',')});
        if (result.isErr()) {
            return types.Result.err<u8[]>(result.err());
        }
        const value = result.ok();
        ${getWriter(internalType, 1, 'value')}
        return types.Result.ok(writer.result());
        `;

    }
    return `
        const writer = new encoding.Writer();
        const result = this.${name}(${params.map((_, i) => `v${i}`).join(',')});
        ${getWriter(returnType, 1, 'result')}
        return types.Result.ok(writer.result());
    `;
}

function createCommandWriter(name: string, params: Method['params']): string {
    return `
        const writer = new encoding.Writer();
        const result = this.${name}(context, ${params.map((_, i) => `v${i}`).join(',')});
        return result;
    `;
}

function createCommandMethod(name: string, params: Method['params']): string {
    return `
    if (method == '${name}') {
        const reader = new encoding.Reader(params);
        ${params.map((param, i)=> `
            const v${i}Result = ${getReader(param.type, i)};
            if (v${i}Result.isErr()) {
                return framework.TransactionExecuteResult.INVALID;
            }
            const v${i} = v${i}Result.ok();
        `).join('')}
        const unreadBytes = reader.assertUnreadBytes();
        if (unreadBytes.isErr()) {
            return framework.TransactionExecuteResult.INVALID;
        }
        ${createCommandWriter(name, params)}
    }
    `;
}

function createViewMethod(name: string, params: Method['params'], returnType: string): string {
    return `
    if (method == '${name}') {
        const reader = new encoding.Reader(params);
        ${params.map((param, i)=> `
            const v${i}Result = ${getReader(param.type, i)};
            if (v${i}Result.isErr()) {
                return v${i}Result.mapErr<u8[]>();
            }
            const v${i} = v${i}Result.ok();
        `).join('')}
        const unreadBytes = reader.assertUnreadBytes();
        if (unreadBytes.isErr()) {
            return unreadBytes.mapErr<u8[]>();
        }
        ${createViewWriter(name, params, returnType)}
    }
    `;
}

export function createCommand(data: ParsedData): string {
    const callables = data.methods.filter(method => containsDecorator(method.decorators, 'command'));
    let result = `public call(context: framework.CommandContext, method: string, params: u8[]): framework.TransactionExecuteResult {\n`;

    if (callables.length === 0) {
        result += `abort("unknown method: "+method); return -1;\n }\n`;
        return result;
    }

    for (const callable of callables) {
        if (callable.params.length === 0 || callable.params[0].type !== 'framework.CommandContext') {
            throw new Error('Invalid parameter for command. First parameter must be framework.CommandContext');
        }
        if (callable.returnType !== 'framework.TransactionExecuteResult') {
            throw new Error('Invalid return type for command. return type must be framework.TransactionExecuteResult');
        }
        result += createCommandMethod(callable.name, callable.params.slice(1));
    }
    result += ``;
    result += `abort("unknown method: "+method); return -1;\n }\n`;
    return result;
}

export function createView(data: ParsedData): string {
    const callables = data.methods.filter(method => containsDecorator(method.decorators, 'view'));
    let result = `public view(method: string, params: u8[]): types.Result<u8[]> {\n`;

    if (callables.length === 0) {
        result += `return types.Result<u8[]>.err("unknown method: "+method);\n }\n`;
        return result;
    }

    for (const callable of callables) {
        result += createViewMethod(callable.name, callable.params, callable.returnType);
    }
    result += ``;
    result += `return types.Result.err<u8[]>("unknown method: "+method);\n };\n`;

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