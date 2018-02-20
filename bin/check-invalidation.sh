#!/usr/bin/env bash

set -euo pipefail
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
ID=''
DRYRUN=''

while [ $# -gt 0 ]; do
  case "$1" in
    -d)
      DRYRUN="--dryrun"
      ;;
    --id=*)
      ID="${1#*=}"
      ;;
    *)
      printf "***************************\n"
      printf "* Error: Invalid argument.*\n"
      printf "***************************\n"
      exit 1
  esac
  shift
done

while [ $(aws --profile dev-frontend     \
  cloudfront get-invalidation         \
    --distribution-id E1F7ECRVBF3EX2  \
    --id ${ID}                        \
    ${DRYRUN}                         \
    --region 'us-east-2' | jq -r '.Invalidation.Status') = "InProgress" ]; do
      printf '.'
      sleep 4
    done

echo Invalidation $(aws --profile dev-frontend     \
  cloudfront get-invalidation         \
    --distribution-id E1F7ECRVBF3EX2  \
    --id ${ID}                        \
    ${DRYRUN}                         \
    --region 'us-east-2' | jq -r '.Invalidation.Status')
