import fs from 'fs';
import ts from 'typescript';
import { promisify } from 'util';
import glob from 'glob';
import path from 'path';

export interface ExtendInterfaceOptions {
    inputPath: string;
    outputPath: string;
    memberPattern: string;
    targetPath: string;
    targetMemberName: string;
}

export default async function extendInterface({
    inputPath,
    // outputPath,
    memberPattern,
    // targetPath,
    // targetMemberPattern,
}: ExtendInterfaceOptions): Promise<string> {
    const filePaths = await promisify(glob)(inputPath);
    const sources = (await Promise.all(
        filePaths.map(filePath => getSourceFromExport(filePath, memberPattern))
    )).flatMap(sources => sources);

    console.log(sources);

    return '';

    /*
    const exportDeclarations = await Promise.all(
        filePaths.map(filePath => createExportDeclaration(filePath, outputPath, memberPattern))
    );

    return ts.createPrinter()
        .printList(
            ts.ListFormat.MultiLine,
            ts.factory.createNodeArray(exportDeclarations.filter(exists)),
            ts.createSourceFile(outputPath, '', ts.ScriptTarget.ESNext)
        );
    */
}

async function getSourceFromExport(filePath: string, memberPattern: string): Promise<ts.SourceFile[]> {
    const root = await getSource(filePath);
    const exportPaths = root.statements
        .filter(ts.isExportDeclaration)
        .filter(statement => {
            if (!statement.exportClause ||
                !ts.isNamedExports(statement.exportClause) ||
                !statement.exportClause.elements?.filter(ts.isExportSpecifier)) {
                return false;
            }

            return statement.exportClause.elements.find(element =>
                element.name.escapedText.toString()?.match(new RegExp(memberPattern))
            );
        })
        .map(statement => statement.moduleSpecifier)
        .filter(exists)
        .filter(ts.isStringLiteral)
        .map(expression => expression.text);

        return Promise.all(
            exportPaths.map(exportPath =>
                getSource(path.resolve(path.dirname(filePath), `${exportPath}.ts`))
            )
        );
}

async function getSource(filePath: string): Promise<ts.SourceFile> {
    const readFile = promisify(fs.readFile);
    const source = await readFile(filePath, { encoding: 'utf8' });

    return ts.createSourceFile(
        path.parse(filePath).name,
        source,
        ts.ScriptTarget.Latest
    );
}

function exists<TValue>(value?: TValue): value is NonNullable<TValue> {
    return value !== null && value !== undefined;
}
