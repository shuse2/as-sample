import { ClassDeclaration, FieldDeclaration, MethodDeclaration, DecoratorNode, Parser } from "assemblyscript/dist/assemblyscript";
import { utils, ASTTransformVisitor, SimpleParser } from "visitor-as";
import { createCodec, getCodecMetadata } from "./codec.js";
import { Metadata, ParsedData } from './types.js';
import { containsDecorator } from "./utils.js";
import fs from 'fs';
import { createCommand, createView, getCommandMetadata, getViewMetadata } from "./command.js";
import { createStoreKey, getStoreMetadata } from "./store.js";
import { createEvent, getEventMetadata } from "./event.js";

const classDecorators = ['module', 'codec', 'event', 'store', 'asset'];

function getDecoratorValue(decorators: DecoratorNode): { name: string, value: (string | number)[] } {
	return {
		name: (decorators.name as any).text ?? '',
		value: decorators.args?.map((arg: any) => {
			if (typeof arg.value.toNumber === 'function') {
				return arg.value.toNumber();
			}
			return arg.value;
		}) ?? [],
	};
}

function getExtendedClassName(node: ClassDeclaration): {class: string, args: string[]} | undefined {
	if (!node.extendsType) {
		return;
	}
	const className = node.extendsType.name.identifier.text;
	if (!node.extendsType.typeArguments) {
		return {
			class: className,
			args: [],
		};
	}
	const args = node.extendsType.typeArguments.map((t: any) => t.name.identifier.text);
	return {
		class: className,
		args,
	};
}

class ModuleMembers extends ASTTransformVisitor {
	parsedData: ParsedData | undefined;
	metadata: Metadata[] = [];

	visitFieldDeclaration(node: FieldDeclaration): void {
		const name = utils.getName(node);
		const type = utils.getName(node.type!);
		// val needs to be handled properly
		const decorators = node.decorators?.map(getDecoratorValue) ?? [];
		// avoid duplicate when running twice
		const exist = this.parsedData?.fields.find(f => f.name === name && f.type === type);
		if (exist) {
			return;
		}
		this.parsedData?.fields.push({
			name,
			type,
			decorators,
		});
	}

	visitMethodDeclaration(node: MethodDeclaration): void {
		const name = utils.getName(node);
		if (name == "constructor") {
			return;
		}
		if (!node.decorators) {
			return;
		}
		const params = node.signature.parameters.map(p => ({
			name: utils.getName(p),
			type: utils.getName(p.type),
		}));
		const returnType = utils.getName(node.signature.returnType);
		const exist = this.parsedData?.methods.find(f => f.name === name);
		if (exist) {
			return;
		}
		this.parsedData!.methods.push({
			name,
			params,
			returnType,
			decorators: node.decorators?.map(getDecoratorValue) ?? [],
		});
	}

	visitClassDeclaration(node: ClassDeclaration): void {
		if (!node.decorators?.some(this.decoratorMatcher)) {
			return;
		}
		this.parsedData = {
			class: utils.getName(node),
			extends: getExtendedClassName(node),
			decorators: node.decorators?.map(getDecoratorValue) ?? [],
			methods: [],
			fields: [],
		};
		// decide on the module name
		const path = node.range.source.normalizedPath.split('/');
		const isLib = path.some(p => p === 'lisk-sdk' || p ==='~lib');
		const modName = path[path.findIndex(p => p === 'assembly') + 1];

		this.visit(node.members);
		// if decorator contains codec, add codec methods
		if (containsDecorator(this.parsedData.decorators, 'codec')) {
			const codec = createCodec(this.parsedData);
			const encode = SimpleParser.parseClassMember(codec.encode, node);
			node.members.push(encode);
			const decode = SimpleParser.parseClassMember(codec.decode, node);
			node.members.push(decode);
		}
		if (containsDecorator(this.parsedData.decorators, 'module')) {
			const commandFunc = createCommand(this.parsedData);
			const command = SimpleParser.parseClassMember(commandFunc, node);
			node.members.push(command);
			const viewFunc = createView(this.parsedData);
			const view = SimpleParser.parseClassMember(viewFunc, node);
			node.members.push(view);
		}
		if (containsDecorator(this.parsedData.decorators, 'store')) {
			const storeKeyFunc = createStoreKey(this.parsedData, modName);
			const command = SimpleParser.parseClassMember(storeKeyFunc.code, node);
			node.members.push(command);
		}
		if (containsDecorator(this.parsedData.decorators, 'event')) {
			const eventFunc = createEvent(this.parsedData, modName);
			const log = SimpleParser.parseClassMember(eventFunc.log, node);
			node.members.push(log);
			const err = SimpleParser.parseClassMember(eventFunc.error, node);
			node.members.push(err);
		}
		// if decorator contains method, add call methods
		super.visitClassDeclaration(node);

		if (!isLib) {
			this._parsedToMeta(this.parsedData, modName);
		}

		this.parsedData = undefined;
	}

	get decoratorMatcher(): (node: DecoratorNode) => boolean {
		return (node: DecoratorNode) => classDecorators.some(name => utils.decorates(node, name))
	}

	afterParse(_: Parser): void {
		let sources = _.sources.filter(utils.not(utils.isStdlib));
		this.visit(sources);
		fs.writeFileSync('./metadata.json', JSON.stringify(this.metadata, undefined, ' '));
	}

	_parsedToMeta(parsed: ParsedData, mod: string): void {
		const existingIndex = this.metadata.findIndex(m => m.name === mod);
		const metadata = existingIndex > -1 ? this.metadata[existingIndex] : {
			name: mod,
			commands: [],
			endpoints: [],
			stores: [],
			events: [],
			codec: [],
		};
		if (containsDecorator(parsed.decorators, 'module')) {
			const commands = getCommandMetadata(parsed);
			metadata.commands.push(...commands);
			const endpoints = getViewMetadata(parsed);
			metadata.endpoints.push(...endpoints);
			
		}
		if (containsDecorator(parsed.decorators, 'event')) {
			const event = getEventMetadata(parsed, mod);
			metadata.events.push(event);
		}
		if (containsDecorator(parsed.decorators, 'codec')) {
			const codec = getCodecMetadata(parsed);
			metadata.codec.push(codec);
		}
		if (containsDecorator(parsed.decorators, 'store')) {
			const store = getStoreMetadata(parsed, mod);
			metadata.stores.push(store);
		}
		const index = existingIndex > -1 ? existingIndex : this.metadata.length;
		this.metadata[index] = metadata;
	}
}

export default new ModuleMembers();
