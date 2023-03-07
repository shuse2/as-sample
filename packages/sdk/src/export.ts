import { Program, DeclaredElement } from "assemblyscript/dist/assemblyscript";
import { PathVisitor, utils } from "visitor-as";

class ExportTransformer extends PathVisitor {
    afterInitialize(program: Program): void {
        const exports = Array.from(program.filesByName.values()).find(
            (file) => file.name === '~lib/lisk-sdk/assembly/internal/system_exports.ts'
        );
        const entry = Array.from(program.filesByName.values()).find(
            (file) => utils.isUserEntry(file.source) && !utils.isLibrary(file.source)
        );
        if (!entry?.exports) {
            throw new Error('invalid entry');
        }
        if (!exports?.exports) {
            throw new Error('invalid exports');
        }
        entry.exports.delete('alloc');
        entry.exports.set('alloc', exports.exports.get('alloc') as DeclaredElement);
        entry.exports.delete('realloc');
        entry.exports.set('realloc', exports.exports.get('realloc') as DeclaredElement);
        entry.exports.delete('free');
        entry.exports.set('free', exports.exports.get('free') as DeclaredElement);
    }
  }

export default new ExportTransformer();