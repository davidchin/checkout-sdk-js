import { API, FileInfo } from 'jscodeshift';

export default function transform(
    fileInfo: FileInfo,
    { jscodeshift: j }: API
) {
    const rootNode = j(fileInfo.source);

    // ----------------------------------------------------------------------
    // Modify imports
    const importPaths = rootNode.find(j.ImportDeclaration);

    // Remove imports of deprecated services
    importPaths.replaceWith(importPath => {
        const specifierCount = importPath.node.specifiers.length;
        const modifiedSpecifiers = importPath.node.specifiers.filter(specifier => {
            return !['OrderActionCreator', 'PaymentActionCreator']
                .includes(specifier.local && specifier.local.name);
        });

        if (specifierCount === 1 && modifiedSpecifiers.length === 0) {
            return;
        }

        importPath.node.specifiers = modifiedSpecifiers;

        return importPath.node;
    });

    // Add import of new service
    importPaths.at(importPaths.size() - 1).insertAfter(
        j.importDeclaration(
            [j.importSpecifier(j.identifier('PaymentIntegrationService'))],
            j.stringLiteral('../../payment-integration-service')
        )
    );

    // ----------------------------------------------------------------------
    // Modify constructor parameters
    const constructorPaths = rootNode.find(j.ClassMethod, node => node.kind === 'constructor');

    constructorPaths.forEach(constructorPath => {
        // Remove deprecated services
        constructorPath.node.params = constructorPath.node.params.filter(node => {
            if (!j.TSParameterProperty.check(node) ||
                !j.Identifier.check(node.parameter) ||
                !j.TSTypeAnnotation.check(node.parameter.typeAnnotation) ||
                !j.TSTypeReference.check(node.parameter.typeAnnotation.typeAnnotation) ||
                !j.Identifier.check(node.parameter.typeAnnotation.typeAnnotation.typeName)) {
                return true;
            }

            return !['OrderActionCreator', 'PaymentActionCreator']
                .includes(node.parameter.typeAnnotation.typeAnnotation.typeName.name);
        });

        // Insert new service
        constructorPath.node.params.push(
            j.tsParameterProperty.from({
                accessibility: 'protected',
                parameter: j.identifier.from({
                    name: '_paymentIntegrationService',
                    typeAnnotation: j.tsTypeAnnotation(
                        j.tsTypeReference(
                            j.identifier('PaymentIntegrationService')
                        )
                    ),
                }),
            })
        );
    });

    // ----------------------------------------------------------------------
    // Replace usage of deprecated services with new service
    const callExpressionPaths = rootNode.find(j.CallExpression, node => {
        return j.MemberExpression.check(node.callee) &&
            j.MemberExpression.check(node.callee.object) &&
            j.Identifier.check(node.callee.object.property) &&
            j.Identifier.check(node.callee.property) &&
            node.callee.object.property.name === '_store' &&
            node.callee.property.name === 'dispatch';
    });

    callExpressionPaths.replaceWith(({ node }) => {
        if (!j.MemberExpression.check(node.callee) ||
            !j.Identifier.check(node.callee.property) ||
            !j.CallExpression.check(node.arguments[0])) {
            return node;
        }

        return j.memberExpression(
            j.memberExpression(
                j.thisExpression(),
                j.identifier('_paymentIntegrationService')
            ),
            j.callExpression(
                node.arguments[0] &&
                j.MemberExpression.check(node.arguments[0].callee) &&
                j.Identifier.check(node.arguments[0].callee.property) &&
                node.arguments[0].callee.property,
                node.arguments[0].arguments
            )
        );
    });

    return rootNode.toSource();
}
