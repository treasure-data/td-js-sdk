#! bash
cd lib
jsdoc2md --configure ../jsdoc-config.json --files "." --no-cache --separators --example-lang js --partial ../scope.hbs --partial ../summary.hbs --partial ../global-index.hbs > ../js-sdk-api.md
