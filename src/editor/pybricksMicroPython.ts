// Copied from https://github.com/microsoft/monaco-languages/blob/main/src/python/python.ts

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { monaco } from 'react-monaco-editor';

export const language = <monaco.languages.IMonarchLanguage>{
    defaultToken: '',
    tokenPostfix: '.python',

    keywords: [
        // This section is the result of running
        // `for k in keyword.kwlist: print('  "' + k + '",')` in a Python REPL,
        // though note that the output from Python 3 is not a strict superset of the
        // output from Python 2.
        'False', // promoted to keyword.kwlist in Python 3
        'None', // promoted to keyword.kwlist in Python 3
        'True', // promoted to keyword.kwlist in Python 3
        'and',
        'as',
        'assert',
        'async', // new in Python 3
        'await', // new in Python 3
        'break',
        'class',
        'continue',
        'def',
        'del',
        'elif',
        'else',
        'except',
        'exec', // Python 2, but not 3.
        'finally',
        'for',
        'from',
        'global',
        'if',
        'import',
        'in',
        'is',
        'lambda',
        'nonlocal', // new in Python 3
        'not',
        'or',
        'pass',
        'print', // Python 2, but not 3.
        'raise',
        'return',
        'try',
        'while',
        'with',
        'yield',

        'int',
        'float',
        'long',
        'complex',
        'hex',

        'abs',
        'all',
        'any',
        'apply',
        'basestring',
        'bin',
        'bool',
        'buffer',
        'bytearray',
        'callable',
        'chr',
        'classmethod',
        'cmp',
        'coerce',
        'compile',
        'complex',
        'delattr',
        'dict',
        'dir',
        'divmod',
        'enumerate',
        'eval',
        'execfile',
        'file',
        'filter',
        'format',
        'frozenset',
        'getattr',
        'globals',
        'hasattr',
        'hash',
        'help',
        'id',
        'input',
        'intern',
        'isinstance',
        'issubclass',
        'iter',
        'len',
        'locals',
        'list',
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
        'raw_input',
        'reduce',
        'reload',
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
        'unichr',
        'unicode',
        'vars',
        'xrange',
        'zip',

        '__dict__',
        '__methods__',
        '__members__',
        '__class__',
        '__bases__',
        '__name__',
        '__mro__',
        '__subclasses__',
        '__init__',
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

function template(hubName: string, devices: string[]): string {
    return `from pybricks.hubs import ${hubName}
from pybricks.pupdevices import ${devices.join(', ')}
from pybricks.parameters import Button, Color, Direction, Port, Stop
from pybricks.robotics import DriveBase
from pybricks.tools import wait, StopWatch

hub = ${hubName}()`;
}

const templateSnippets: Array<
    Required<
        Pick<monaco.languages.CompletionItem, 'label' | 'documentation' | 'insertText'>
    > & { label: string }
> = [
    {
        label: 'technichub',
        documentation: 'Template for Technic hub program.',
        insertText: template('TechnicHub', ['Motor']),
    },
    {
        label: 'cityhub',
        documentation: 'Template for City hub program.',
        insertText: template('CityHub', ['DCMotor', 'Light']),
    },
    {
        label: 'movehub',
        documentation: 'Template for BOOST Move hub program.',
        insertText: template('MoveHub', ['Motor', 'ColorDistanceSensor']),
    },
    {
        label: 'primehub',
        documentation: 'Template for SPIKE Prime program.',
        insertText: template('PrimeHub', [
            'Motor',
            'ColorSensor',
            'UltrasonicSensor',
            'ForceSensor',
        ]),
    },
    {
        label: 'inventorhub',
        documentation: 'Template for MINDSTORMS Robot Inventor hub program.',
        insertText: template('InventorHub', [
            'Motor',
            'ColorSensor',
            'UltrasonicSensor',
        ]),
    },
];

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
                kind: monaco.languages.CompletionItemKind.Snippet,
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
