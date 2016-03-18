requirejs.config({
  baseUrl: '/fixtures/amd'
})

requirejs(['executeTest'], function (executeTest) {
  executeTest()
})
