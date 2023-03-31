/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const {Generator} = require('npm-dts');

const drop = ['debugger'];

if (!process.argv.includes('--watch')) {
    drop.push('console');
}

const cdnSharedConfig = {
    entryPoints: ["src/cdn.ts"],
    drop,
    treeShaking: true,
};

if (process.argv.includes('--watch')) {
    cdnSharedConfig.sourcemap = true;
}

const sharedConfig = {
    entryPoints: ["src/index.ts"],
    drop,
    treeShaking: true
};

// Intended for CDN
build({
    ...cdnSharedConfig,
    outfile: "dist/cdn.js",
    bundle: true,
    platform: 'browser',
});

build({
    ...cdnSharedConfig,
    outfile: "dist/cdn.min.js",
    bundle: true,
    minify: true,
    platform: 'browser',
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
    try {
        await new Generator({
            entry: 'src/index.ts',
            output: 'dist/index.d.ts',
        }).generate();

        if (process.argv.includes('--watch')) {
            const ctx = await require('esbuild').context({
                ...options,
            });

            return await ctx.watch();
        } else {
            return await require('esbuild').build({
                ...options,
            });
        }
    } catch {
        return process.exit(1);
    }
}