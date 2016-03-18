window.requirejs.config({
  baseUrl: '/fixtures/amd'
})

window.requirejs(['executeTest'], function (executeTest) {
  executeTest()
})
