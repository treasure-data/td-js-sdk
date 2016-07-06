#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
VERSION=$(cat $ROOT_DIR/package.json | jq -r '.version')

aws s3 sync ./dist/ s3://td-cdn/sdk/$VERSION/ \
  --acl "public-read" \
  --cache-control "public, max-age=315360000" \
  --exclude "*loader.min.js" \
  --profile td-cdn --dryrun
