import nodeExternals from 'webpack-node-externals'

// Bundle workspace packages (source-only) and keep every other dependency external.
export default (defaults) => ({
  ...defaults,
  externals: [
    nodeExternals({ importType: 'module', allowlist: [/^@fitness\//] }),
    ...defaults.externals.slice(1),
  ],
})
