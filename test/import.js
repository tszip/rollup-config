// import * as module from 'your-package-name';
import * as module from '../dist/index.js';

import { createConfig } from '@tszip/rollup-config';
import { requireShim } from '@tszip/rollup-config/plugins/requireShim';

console.log(module);
console.log({ requireShim });
console.log({ createConfig });
