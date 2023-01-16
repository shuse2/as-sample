import { ClassDeclaration, FieldDeclaration, MethodDeclaration, DecoratorNode, Parser } from "assemblyscript/dist/assemblyscript";
import {utils, ASTTransformVisitor, SimpleParser } from "visitor-as";
import {createCodec} from "./codec.js";
import { Metadata, ParsedData } from './types.js';
import {containsDecorator} from "./utils.js";
import fs from 'fs';

const classDecorators = ['module', 'codec', 'event', 'store', 'asset'];

class ModuleMembers extends ASTTransformVisitor {
	parsedData: ParsedData | undefined;
	metadata: Metadata[] = [];
	
  visitFieldDeclaration(node: FieldDeclaration): void {
    const name = utils.getName(node);
    const type = utils.getName(node.type!);
		// val needs to be handled properly
		const decorators = node.decorators?.map(d => ({
			name: (d.name as any).text,
			value: ((d.args?.[0] as any).value).toNumber() ?? '',
		})) ?? [];
		this.parsedData!.fields.push({
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
		this.parsedData!.methods.push({
			name,
			params,
			returnType,
			decorators: node.decorators?.map(d => ({
				name: (d.name as any).text,
				value: '',
			})) ?? [],
		});
	}

  visitClassDeclaration(node: ClassDeclaration): void {
		if (!node.decorators?.some(this.decoratorMatcher)) {
			return;
		}
		this.parsedData = {
			class: utils.getName(node),
			decorators: node.decorators?.map(d => ({
				name: (d.name as any).text,
				value: '',
			})) ?? [],
			methods: [],
			fields: [],
		};
		// decide on the module name
		const path = node.range.source.normalizedPath.split('/');
		const modName = path[path.findIndex(p => p === 'assembly') + 1];

		this.visit(node.members);
		// if decorator contains codec, add codec methods
		if (containsDecorator(this.parsedData.decorators, 'codec')) {
			const codec = createCodec(this.parsedData);
			const encode = SimpleParser.parseClassMember(codec.encode, node);
			node.members.push(encode);
			const decode = SimpleParser.parseClassMember(codec.decode, node);
			node.members.push(decode);
			super.visitClassDeclaration(node);
		}
		// if decorator contains method, add call methods
		super.visitClassDeclaration(node);

		this._parsedToMeta(this.parsedData, modName);

		this.parsedData = undefined;
  }

	get decoratorMatcher(): (node: DecoratorNode) => boolean {
    return (node: DecoratorNode) => classDecorators.some(name => utils.decorates(node, name))
  }

	afterParse(_: Parser): void {
    let sources = _.sources.filter(utils.not(utils.isStdlib));
    this.visit(sources);
		fs.writeFileSync('./metadata.json', JSON.stringify(this.metadata));
  }

	_parsedToMeta(parsed: ParsedData, mod: string): void {
		const existingIndex = this.metadata.findIndex(m => m.name === mod);
		const metadata = existingIndex > -1 ? this.metadata[existingIndex] : {
			name: mod,
			commands: [],
			stores: [],
			events: [],
		};
		if (containsDecorator(parsed.decorators, 'module')) {
			const commands = parsed.methods.map(m => ({
				name: m.name,
				params: m.params.map((p, i) => ({
					name: p.name,
					type: p.type,
					fieldNumber: i + 1,
				})),
				returnType: m.returnType,
			}));
			metadata.commands.push(...commands);
		}	
		const index = existingIndex > -1 ? existingIndex : this.metadata.length;
		this.metadata[index] = metadata;
	}
}

export default new ModuleMembers();
