module.exports = {
  sourceType: 'unambiguous',
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.25%, ie >= 11, safari >= 9, ios >= 6, android >= 7'
      }
    ]
  ],
  plugins: ['@babel/plugin-transform-runtime']
}
