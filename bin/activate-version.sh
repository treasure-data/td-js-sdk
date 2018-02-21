#!/usr/bin/env bash

DRYRUN='--dryrun'
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
VERSION=$(jq -r '.version' < "${ROOT_DIR}/package.json")
TO_VERSION=$(echo $VERSION | sed 's/\.[0-9]*$//g')
WAIT=0
while [ $# -gt 0 ]; do
  case "$1" in
    -f|--force)
      DRYRUN=""
      ;;
    --wait)
      WAIT=1
      ;;
    *)
      printf "***************************\n"
      printf "* Error: Invalid argument.*\n"
      printf "***************************\n"
      exit 1
  esac
  shift
done

set -euo pipefail

aws --profile dev-frontend                      \
  s3 sync "s3://td-cdn-experiment/sdk/${VERSION}/" "s3://td-cdn-experiment/sdk/${TO_VERSION}/" \
    ${DRYRUN}                                   \
    --region 'us-east-2'                        \
    --acl 'public-read'                         \
    --cache-control 'public, max-age=315360000' \
    --exclude "*loader.min.js"

if [ "$DRYRUN" != '' ]; then
  exit 0
fi

if [ $WAIT -eq 1 ]; then
  ./bin/invalidate-release.sh --version=${TO_VERSION} --wait
else
  ./bin/invalidate-release.sh --version=${TO_VERSION}
fi
