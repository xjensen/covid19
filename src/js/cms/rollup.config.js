import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/js/index.js',
  output: {
    file: 'docs/cms/built-netlify-cms.js',
    format: 'esm'
  },
  plugins: [resolve(), terser()]
};
