#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
VERSION=$(cat $ROOT_DIR/package.json | jq -r '.version')
HOST='in.treasuredata.com'
DATABASE=""
PATHNAME="/js/v3/event/"
GLOBAL="Treasure"
FILENAME="td"
TO_VERSION=$(echo $VERSION | sed 's/\.[-a-zA-Z0-9]*$//g')

while [ $# -gt 0 ]; do
  case "$1" in
    --HOST=*)
      HOST="${1#*=}"
      ;;
    --DATABASE=*)
      DATABASE="${1#*=}"
      ;;
    --PATHNAME=*)
      PATHNAME="${1#*=}"
      ;;
    --GLOBAL=*)
      GLOBAL="${1#*=}"
      ;;
    --FILENAME=*)
      FILENAME="${1#*=}"
      ;;
    --URL=*)
      URL="${1#*=}"
      ;;
    --TO-VERSION=*)
      TO_VERSION="${1#*=}"
      ;;
    *)
      printf "***************************\n"
      printf "* Error: Invalid argument.*\n"
      printf "***************************\n"
      exit 1
  esac
  shift
done

URL="//cdn.treasuredata.com/sdk/${TO_VERSION}/td.min.js"
VERSION_REPLACE="s/@VERSION/$VERSION/g"
GLOBAL_REPLACE="s/@GLOBAL/$GLOBAL/g"
HOST_REPLACE="s/@HOST/$HOST/g"
DATABASE_REPLACE="s/@DATABASE/$DATABASE/g"
PATHNAME_REPLACE="s^@PATHNAME^$PATHNAME^g"
URL_REPLACE="s^@URL^$URL^g"
BUILT_FILENAME="$ROOT_DIR/dist/td.js"
MINIFIED_FILENAME="$ROOT_DIR/dist/td.min.js"

sed -e $GLOBAL_REPLACE -e $VERSION_REPLACE -e $HOST_REPLACE -e $DATABASE_REPLACE -e $PATHNAME_REPLACE lib/config.template.js > lib/config.js

#NODE_ENV=production
$ROOT_DIR/node_modules/.bin/webpack
if [ $FILENAME != "td" ]
then
  mv $ROOT_DIR/dist/td.js $ROOT_DIR/dist/$FILENAME.js
fi

MINIFY_BUILD=true $ROOT_DIR/node_modules/.bin/webpack --output-filename [name].min.js
if [ $FILENAME != "td" ]
then
  mv $ROOT_DIR/dist/td.min.js $ROOT_DIR/dist/$FILENAME.min.js
fi

cat $ROOT_DIR/src/loader.js |
  sed -e $GLOBAL_REPLACE -e $URL_REPLACE |
  $ROOT_DIR/node_modules/.bin/uglifyjs -m -c > $ROOT_DIR/dist/loader.min.js

ESCAPED_LOADER="$(echo $ROOT_DIR/dist/loader.min.js | sed -e 's^/^\\/^g')"

sed -i '.backup' "/\!function.*/ {
  r $ROOT_DIR/dist/loader.min.js
  d
}" $ROOT_DIR/README.md && rm $ROOT_DIR/README.md.backup

sed -i '.backup' 's_;</script>_;\
</script>_' $ROOT_DIR/README.md && rm $ROOT_DIR/README.md.backup

if [ $FILENAME != "td" ]
then
  rm $BUILT_FILENAME $MINIFIED_FILENAME
fi || 0
