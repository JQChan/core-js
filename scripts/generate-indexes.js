'use strict';
const { readdir, writeFile } = require('fs').promises;
const { green } = require('chalk');
const compat = require('core-js-compat/src/data');

const modules = Object.keys(compat);

async function generateNamespaceIndex(ns, filter) {
  return writeFile(`./packages/core-js/${ ns }/index.js`, `${ modules
    .filter(it => filter.test(it))
    .map(it => `require('../modules/${ it }');\n`)
    .join('') }\nmodule.exports = require('../internals/path');\n`);
}

async function generateTestsIndex(name, pkg) {
  const dir = `./tests/${ name }`;
  const files = await readdir(dir);
  return writeFile(`${ dir }/index.js`, `${ files
    .filter(it => /^(?:es|esnext|web)\./.test(it))
    .map(it => `import './${ it.slice(0, -3) }';\n`)
    .join('') }${ pkg !== 'core-js' ? `\nimport core from '${ pkg }';\ncore.globalThis.core = core;\n` : '' }`);
}

(async () => {
  await generateNamespaceIndex('es', /^es\./);
  await generateNamespaceIndex('stable', /^(es|web)\./);
  await generateNamespaceIndex('features', /^(es|esnext|web)\./);

  await generateTestsIndex('tests', 'core-js');
  await generateTestsIndex('pure', 'core-js-pure');
  // eslint-disable-next-line no-console -- output
  console.log(green('indexes generated'));
})();
