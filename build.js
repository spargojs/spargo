const { dependencies, peerDependencies } = require('./package.json')
const { Generator } = require('npm-dts');

new Generator({
  entry: 'src/index.ts',
  output: 'dist/index.d.ts',
}).generate();

const sharedConfig = {
  external: Object.keys(dependencies).concat(Object.keys(peerDependencies)),
  entryPoints: ["src/index.ts"]
};

// Intended for CDN
build({
  ...sharedConfig,
  outfile: "dist/index.js",
  bundle: true,
  platform: 'browser',
  define: { CDN: true },
});

build({
  ...sharedConfig,
  outfile: "dist/index.min.js",
  bundle: true,
  minify: true,
  platform: 'browser',
  define: { CDN: true },
});

// The ESM one is meant for "import" statements (bundlers and new browsers)
build({
  ...sharedConfig,
  outfile: "dist/index.esm.js",
  bundle: true,
  platform: 'neutral',
  mainFields: ['module', 'main'],
});

// The cjs one is meant for "require" statements (node)
build({
  ...sharedConfig,
  outfile: "dist/index.cjs.js",
  bundle: true,
  target: ['node10.4'],
  platform: 'node',
});

async function build(options) {
  options.define || (options.define = {})

  options.define['process.env.NODE_ENV'] = process.argv.includes('--watch') ? `'production'` : `'development'`

  try {
    return await require('esbuild').build({
      watch: process.argv.includes('--watch'),
      ...options,
    });
  } catch {
    return process.exit(1);
  }
};