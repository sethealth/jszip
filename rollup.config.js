import nodeResolve from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'lib/index.js',
    output: [
      {
        format: 'esm',
        file: 'dist/jszip.esm.js',
        preferConst: true,
      },
      {
        format: 'commonjs',
        file: 'dist/jszip.js',
        preferConst: true,
      },
    ],
    plugins: [
      nodeResolve(),
    ],
    external: [
      "@sethealth/pako"
    ]
  },
];
