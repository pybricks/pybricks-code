// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

// This should be moved to the IDE docs package.

const getMicroPythonDocsUrl = (module: string, identifier: string): string => {
    const u = module === 'builtins' ? 'u' : '';

    if (module && identifier) {
        return `micropython/${module}.html#${u}${module}.${identifier}`;
    }
    return `micropython/builtins.html`;
};

const getPybricksDocsUrl = (
    moduleName: string,
    className: string | undefined,
    componentOrMethodName: string | undefined,
    methodName: string | undefined,
): string => {
    if (moduleName === 'tools') {
        return `${moduleName}/index.html#pybricks.${moduleName}.${className}.${componentOrMethodName}`;
    }
    if (moduleName === 'robotics') {
        return `${moduleName}.html#pybricks.${moduleName}.${className}.${componentOrMethodName}`;
    }
    if (moduleName === 'hubs') {
        const hub = className === 'InventorHub' ? 'PrimeHub' : className;
        return `${moduleName}/${hub?.toLowerCase()}.html#pybricks.${moduleName}.${hub}.${componentOrMethodName}.${methodName}`;
    }
    if (moduleName === 'pupdevices') {
        return `${moduleName}/${className?.toLowerCase()}.html#pybricks.${moduleName}.${className}.${componentOrMethodName}`;
    }
    if (moduleName === 'parameters') {
        return `${moduleName}/${className?.toLowerCase()}.html#pybricks.${moduleName}.${className}.${componentOrMethodName}`;
    }
    return `${moduleName}.html`;
};

export const getDocsUrl = (reference: string, _image: string): string => {
    console.log('getDocsUrl', reference);
    const namespace = reference.split('.');

    if (namespace[0] === 'blocks') {
        return 'blocks/index.html';
    }

    if (namespace[0] === 'micropython') {
        return getMicroPythonDocsUrl(namespace[1], namespace[2]);
    }

    if (namespace[0] === 'pybricks') {
        const url = getPybricksDocsUrl(
            namespace[1],
            namespace[2],
            namespace[3],
            namespace[4],
        );
        return url.replaceAll('.undefined', '');
    }

    return '';
};
