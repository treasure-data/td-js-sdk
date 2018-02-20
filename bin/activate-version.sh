#!/usr/bin/env bash

DRYRUN=''
VERSION=''
TO_VERSION=''
WAIT=0
while [ $# -gt 0 ]; do
  case "$1" in
    -d)
      DRYRUN="--dryrun"
      ;;
    --version=*)
      VERSION="${1#*=}"
      ;;
    --to-version=*)
      TO_VERSION="${1#*=}"
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

if [ "$VERSION" = '' ]; then
  printf "Must specify VERSION"
  exit 1
fi

if [ "$TO_VERSION" = '' ]; then
  printf "Must specify TO_VERSION"
  exit 1
fi

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
