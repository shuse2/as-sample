import { ClassDeclaration, FieldDeclaration, MethodDeclaration } from "assemblyscript/dist/assemblyscript";
import {registerDecorator, ClassDecorator, utils } from "visitor-as";

class ModuleMembers extends ClassDecorator {
  visitFieldDeclaration(node: FieldDeclaration): void {
    if (!node.name) console.log(utils.getName(node) + "\n");
    const name = utils.getName(node);
    const _type = utils.getName(node.type!);
    this.stdout.write(name + ": " + _type + "\n");
  }

	visitMethodDeclaration(node: MethodDeclaration): void {
		const name = utils.getName(node);
		if (name == "constructor") {
			return;
		}
		const params = node.signature.parameters.map(p => ({
			name: utils.getName(p),
			type: utils.getName(p.type),
		}));
		const returnType = utils.getName(node.signature.returnType);
		this.stdout.write(`${name}(${params.map(p => `${p.name}: ${p.type}`)}): ${returnType}\n`); 
	}

  visitClassDeclaration(node: ClassDeclaration): void {
    this.visit(node.members);
  }

  get name(): string {
    return "module";
  }
}

export default registerDecorator(new ModuleMembers());
