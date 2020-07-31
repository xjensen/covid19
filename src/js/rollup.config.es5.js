import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/js/es5.js',
  output: {
    file: 'docs/js/es5.js',
    format: 'umd'
  },
  moduleContext: {
    // whatwg-fetch angers Rollup due to ancient use of 'this'.
    // This fix is not essential to function. It removes a warning during the build process.
    // https://rollupjs.org/guide/en/#error-this-is-undefined
    [path.resolve('./node_modules/whatwg-fetch/fetch.js')]: 'window'
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
            targets: {
              browsers: '> 1%'
            }
          }
        ]
      ]
    }),
    terser()
  ]
};
