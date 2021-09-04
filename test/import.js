// import * as module from 'your-package-name';
import * as module from '../dist/index.js';
console.log(module);

import { requireShim } from 'rollup-plugins/plugins/requireShim'
console.log({ requireShim })

import { createConfig } from 'rollup-plugins'
console.log({ createConfig })