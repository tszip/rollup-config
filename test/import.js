// import * as module from 'your-package-name';
import * as module from '../dist/index.js';
console.log(module);

import { requireShim } from '@tszip/rollup-config/plugins/requireShim'
console.log({ requireShim })

import { createConfig } from '@tszip/rollup-config'
console.log({ createConfig })