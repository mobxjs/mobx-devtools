import ts from 'rollup-plugin-typescript';
import typescript from 'typescript';
import { uglify } from 'rollup-plugin-uglify';

const config = {
  input: 'src/index.ts',
  output: {
    dir: 'lib',
    format: 'cjs',
  },
  plugins: [
    ts({
      typescript,
    }),
    process.env.mode === 'production' ? uglify() : null,
  ],
};

export default config;
