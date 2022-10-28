// Copied from https://github.com/microsoft/monaco-languages/blob/d7cc098c481059f63d51ce3753975c8ca8ab6030/src/python/python.ts

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { monaco } from 'react-monaco-editor';

/** The Pybricks MicroPython language identifier. */
export const pybricksMicroPythonId = 'pybricks-micropython';

export const conf: monaco.languages.LanguageConfiguration = {
    comments: {
        lineComment: '#',
        blockComment: ["'''", "'''"],
    },
    brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
    ],
    autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"', notIn: ['string'] },
        { open: "'", close: "'", notIn: ['string', 'comment'] },
    ],
    surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
    ],
    onEnterRules: [
        {
            beforeText: new RegExp(
                '^\\s*(?:def|class|for|if|elif|else|while|try|with|finally|except|async).*?:\\s*$',
            ),
            action: { indentAction: <monaco.languages.IndentAction.Indent>1 },
        },
    ],
    folding: {
        offSide: true,
        markers: {
            start: new RegExp('^\\s*#region\\b'),
            end: new RegExp('^\\s*#endregion\\b'),
        },
    },
};

export const language = <monaco.languages.IMonarchLanguage>{
    defaultToken: '',
    tokenPostfix: '.python',

    // https://docs.python.org/3/reference/lexical_analysis.html#keywords
    keywords: <ReadonlyArray<string>>[
        'False',
        'None',
        'True',
        'and',
        'as',
        'assert',
        'async',
        'await',
        'break',
        'class',
        'continue',
        'def',
        'del',
        'elif',
        'else',
        'except',
        'finally',
        'for',
        'from',
        'global',
        'if',
        'import',
        'in',
        'is',
        'lambda',
        'nonlocal',
        'not',
        'or',
        'pass',
        'raise',
        'return',
        'try',
        'while',
        'with',
        'yield',
    ],

    // https://docs.python.org/3/library/functions.html#built-in-funcs
    builtins: <ReadonlyArray<string>>[
        'abs',
        'all',
        'any',
        'ascii',
        'bin',
        'bool',
        'breakpoint',
        'bytearray',
        'bytes',
        'callable',
        'chr',
        'classmethod',
        'compile',
        'complex',
        'delattr',
        'dict',
        'dir',
        'divmod',
        'enumerate',
        'eval',
        'exec',
        'filter',
        'float',
        'format',
        'frozenset',
        'getattr',
        'globals',
        'hasattr',
        'hash',
        'help',
        'hex',
        'id',
        'input',
        'int',
        'isinstance',
        'issubclass',
        'iter',
        'len',
        'list',
        'locals',
        'map',
        'max',
        'memoryview',
        'min',
        'next',
        'object',
        'oct',
        'open',
        'ord',
        'pow',
        'print',
        'property',
        'reversed',
        'range',
        'repr',
        'reversed',
        'round',
        'self',
        'set',
        'setattr',
        'slice',
        'sorted',
        'staticmethod',
        'str',
        'sum',
        'super',
        'tuple',
        'type',
        'vars',
        'zip',
        '__import__',
    ],

    brackets: [
        { open: '{', close: '}', token: 'delimiter.curly' },
        { open: '[', close: ']', token: 'delimiter.bracket' },
        { open: '(', close: ')', token: 'delimiter.parenthesis' },
    ],

    tokenizer: {
        root: [
            { include: '@whitespace' },
            { include: '@numbers' },
            { include: '@strings' },
            { include: '@operators' },

            [/[,:;]/, 'delimiter'],
            [/[{}[\]()]/, '@brackets'],

            [/@[a-zA-Z_]\w*/, 'tag'],

            [
                /[a-zA-Z_]\w*/,
                {
                    cases: {
                        '@keywords': 'keyword',
                        '@builtins': 'support.function',
                        '@default': 'identifier',
                    },
                },
            ],
        ],

        // Deal with white space, including single and multi-line comments
        whitespace: [
            [/\s+/, 'white'],
            [/(^#.*$)/, 'comment'],
            [/'''/, 'string', '@endDocString'],
            [/"""/, 'string', '@endDblDocString'],
        ],
        endDocString: [
            [/[^']+/, 'string'],
            [/\\'/, 'string'],
            [/'''/, 'string', '@popall'],
            [/'/, 'string'],
        ],
        endDblDocString: [
            [/[^"]+/, 'string'],
            [/\\"/, 'string'],
            [/"""/, 'string', '@popall'],
            [/"/, 'string'],
        ],

        // Recognize hex, negatives, decimals, imaginaries, longs, and scientific notation
        numbers: [
            [/-?0x([abcdef]|[ABCDEF]|\d)+[lL]?/, 'constant.numeric.hex'],
            [/-?(\d*\.)?\d+([eE][+-]?\d+)?[jJ]?[lL]?/, 'constant.numeric'],
        ],

        // Recognize strings, including those broken across lines with \ (but not without)
        strings: [
            [/'$/, 'string.escape', '@popall'],
            [/'/, 'string.escape', '@stringBody'],
            [/"$/, 'string.escape', '@popall'],
            [/"/, 'string.escape', '@dblStringBody'],
        ],
        stringBody: [
            [/[^\\']+$/, 'string', '@popall'],
            [/[^\\']+/, 'string'],
            [/\\./, 'string'],
            [/'/, 'string.escape', '@popall'],
            [/\\$/, 'string'],
        ],
        dblStringBody: [
            [/[^\\"]+$/, 'string', '@popall'],
            [/[^\\"]+/, 'string'],
            [/\\./, 'string'],
            [/"/, 'string.escape', '@popall'],
            [/\\$/, 'string'],
        ],

        operators: [[/[=+\-*/%@&|<>!~^]/, 'keyword.operator']],

        attributes: [
            [/\b/, '@pop'],
            [/[a-zA-Z_]\w*/, 'attribute'],
        ],
    },
};

/**
 * Creates a new template for the given parameters.
 *
 * @param hubClassName The hub class name, e.g. `"MoveHub"`.
 * @param deviceClassNames A list of device class names, e.g. `["Motor"]`.
 * @returns The template.
 */
function createTemplate(hubClassName: string, deviceClassNames: string[]): string {
    return `from pybricks.hubs import ${hubClassName}
from pybricks.pupdevices import ${deviceClassNames.join(', ')}
from pybricks.parameters import Button, Color, Direction, Port, Stop
from pybricks.robotics import DriveBase
from pybricks.tools import wait, StopWatch

hub = ${hubClassName}()

`;
}

type HubLabel =
    | 'movehub'
    | 'cityhub'
    | 'technichub'
    | 'inventorhub'
    | 'primehub'
    | 'essentialhub';

const templateSnippets: Array<
    Required<
        Pick<monaco.languages.CompletionItem, 'label' | 'documentation' | 'insertText'>
    > & { label: HubLabel }
> = [
    {
        label: 'technichub',
        documentation: 'Template for Technic hub program.',
        insertText: createTemplate('TechnicHub', ['Motor']),
    },
    {
        label: 'cityhub',
        documentation: 'Template for City hub program.',
        insertText: createTemplate('CityHub', ['DCMotor', 'Light']),
    },
    {
        label: 'movehub',
        documentation: 'Template for BOOST Move hub program.',
        insertText: createTemplate('MoveHub', ['Motor', 'ColorDistanceSensor']),
    },
    {
        label: 'inventorhub',
        documentation: 'Template for MINDSTORMS Robot Inventor hub program.',
        insertText: createTemplate('InventorHub', [
            'Motor',
            'ColorSensor',
            'UltrasonicSensor',
        ]),
    },
    {
        label: 'primehub',
        documentation: 'Template for SPIKE Prime program.',
        insertText: createTemplate('PrimeHub', [
            'Motor',
            'ColorSensor',
            'UltrasonicSensor',
            'ForceSensor',
        ]),
    },
    {
        label: 'essentialhub',
        documentation: 'Template for SPIKE Essential program.',
        insertText: createTemplate('EssentialHub', [
            'Motor',
            'ColorSensor',
            'ColorLightMatrix',
        ]),
    },
];

/**
 * Gets the template text for a Pybricks MicroPython file.
 * @param hub The hub label.
 */
export function getPybricksMicroPythonFileTemplate(
    hub: HubLabel | undefined,
): string | undefined {
    return templateSnippets.find((t) => t.label === hub)?.insertText;
}

export const templateSnippetCompletions = <monaco.languages.CompletionItemProvider>{
    provideCompletionItems: (model, position, _context, _token) => {
        // templates snippets are only available on the first line
        if (position.lineNumber !== 1) {
            return undefined;
        }

        const range = {
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
        };

        const textUntilPosition = model.getValueInRange(range);

        const items = templateSnippets
            .filter((x) => x.label.startsWith(textUntilPosition))
            .map<monaco.languages.CompletionItem>((x) => ({
                detail: x.insertText,
                kind: <monaco.languages.CompletionItemKind.Snippet>27,
                range,
                ...x,
            }));

        if (!items) {
            return undefined;
        }

        return { suggestions: items };
    },
};

// old snippets from ace editor
// eslint-disable-next-line
const _unused = `
snippet imp
	import \${1:module}
snippet from
	from \${1:package} import \${2:module}
# Module Docstring
snippet docs
	'''
	File: \${1:FILENAME:file_name}
	Author: \${2:author}
	Date: \${3:date}
	Description: \${4}
	'''
snippet wh
	while \${1:condition}:
		\${2:# TODO: write code...}
# dowh - does the same as do...while in other languages
snippet dowh
	while True:
		\${1:# TODO: write code...}
		if \${2:condition}:
			break
snippet with
	with \${1:expr} as \${2:var}:
		\${3:# TODO: write code...}
# New Class
snippet cl
	class \${1:ClassName}(\${2:object}):
		"""\${3:docstring for $1}"""
		def __init__(self, \${4:arg}):
			\${5:super($1, self).__init__()}
			self.$4 = $4
			\${6}
# New Function
snippet def
	def \${1:fname}(\${2:\`indent('.') ? 'self' : ''\`}):
		"""\${3:docstring for $1}"""
		\${4:# TODO: write code...}
snippet deff
	def \${1:fname}(\${2:\`indent('.') ? 'self' : ''\`}):
		\${3:# TODO: write code...}
# New Method
snippet defs
	def \${1:mname}(self, \${2:arg}):
		\${3:# TODO: write code...}
# New Property
snippet property
	@property
	def \${1:pname}():
			\${2:return self._$1}
# Ifs
snippet if
	if \${1:condition}:
		\${2:# TODO: write code...}
snippet el
	else:
		\${1:# TODO: write code...}
snippet ei
	elif \${1:condition}:
		\${2:# TODO: write code...}
# For
snippet for
	for \${1:item} in \${2:items}:
		\${3:# TODO: write code...}
# Lambda
snippet ld
	\${1:var} = lambda \${2:vars} : \${3:action}
snippet .
	self.
snippet try Try/Except
	try:
		\${1:# TODO: write code...}
	except \${2:Exception} as \${3:e}:
		\${4:raise $3}
snippet try Try/Except/Else
	try:
		\${1:# TODO: write code...}
	except \${2:Exception} as \${3:e}:
		\${4:raise $3}
	else:
		\${5:# TODO: write code...}
snippet try Try/Except/Finally
	try:
		\${1:# TODO: write code...}
	except \${2:Exception} as \${3:e}:
		\${4:raise $3}
	finally:
		\${5:# TODO: write code...}
snippet try Try/Except/Else/Finally
	try:
		\${1:# TODO: write code...}
	except \${2:Exception} as \${3:e}:
		\${4:raise $3}
	else:
		\${5:# TODO: write code...}
	finally:
		\${6:# TODO: write code...}
snippet "
	"""
	\${1:doc}
	"""
`;
