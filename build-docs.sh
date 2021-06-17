#! bash
cd lib
jsdoc2md --configure ../jsdoc-config.json --files "." --no-cache --separators --example-lang js --partial ../scope.hbs --partial ../summary.hbs > ../js-sdk-api.md

# local helper, delete before committing
rm ~/code/TD-API-Documentation/docs/js-sdk/js-sdk-api.md
cp ~/code/td-js-sdk/js-sdk-api.md ~/code/TD-API-Documentation/docs/js-sdk/js-sdk-api.md
