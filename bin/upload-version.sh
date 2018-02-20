#!/usr/bin/env bash

DRYRUN=''
if [ "$1" = '-d' ]; then
  DRYRUN='--dryrun'
fi

set -euo pipefail

ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
VERSION=$(jq -r '.version' < "${ROOT_DIR}/package.json")

aws --profile dev-frontend                      \
  s3 sync ./dist/ "s3://td-cdn-experiment/sdk/${VERSION}/" \
    ${DRYRUN}                                   \
    --region 'us-east-2'                        \
    --acl 'public-read'                         \
    --cache-control 'public, max-age=315360000' \
    --exclude "*loader.min.js"
