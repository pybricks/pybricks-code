/* eslint-disable @typescript-eslint/no-explicit-any */
import ace from 'ace-builds';

// fixups for Ace editor bindings
declare module 'ace-builds' {
    export function define(
        module: string,
        deps: string[],
        payload?: (require: any, exports: any, module: any) => void,
    ): void;
    export function require(name: string[], callback: (module: any) => void): any;
}

ace.define('ace/snippets/python', ['require', 'exports', 'module'], function (
    _require,
    exports,
    _module,
) {
    // IMPORTANT!!!!!
    // Snippets must be indented with tab character, not spaces!
    exports.snippetText = `snippet cplushub
	from pybricks.hubs import CPlusHub
	from pybricks.pupdevices import Motor
	from pybricks.parameters import Port, Stop
	from pybricks.tools import wait

	hub = CPlusHub()
snippet movehub
	from pybricks.hubs import MoveHub
	from pybricks.pupdevices import Motor
	from pybricks.parameters import Port, Stop
	from pybricks.tools import wait

	hub = MoveHub()
snippet uname
	from uos import uname
	
	print(uname())
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
# Encodes
snippet cutf8
	# -*- coding: utf-8 -*-
snippet clatin1
	# -*- coding: latin-1 -*-
snippet cascii
	# -*- coding: ascii -*-
# Lambda
snippet ld
	\${1:var} = lambda \${2:vars} : \${3:action}
snippet .
	self.
snippet try Try/Except
	try:
		\${1:# TODO: write code...}
	except \${2:Exception}, \${3:e}:
		\${4:raise $3}
snippet try Try/Except/Else
	try:
		\${1:# TODO: write code...}
	except \${2:Exception}, \${3:e}:
		\${4:raise $3}
	else:
		\${5:# TODO: write code...}
snippet try Try/Except/Finally
	try:
		\${1:# TODO: write code...}
	except \${2:Exception}, \${3:e}:
		\${4:raise $3}
	finally:
		\${5:# TODO: write code...}
snippet try Try/Except/Else/Finally
	try:
		\${1:# TODO: write code...}
	except \${2:Exception}, \${3:e}:
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
    exports.scope = 'python';
});

(function (): void {
    ace.require(['ace/snippets/python'], function (m: any) {
        if (typeof module == 'object' && typeof exports == 'object' && module) {
            module.exports = m;
        }
    });
})();
