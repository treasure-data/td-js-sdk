#!/usr/bin/env bash

set -euo pipefail
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
VERSION=$(jq -r '.version' < "${ROOT_DIR}/package.json")
DRYRUN='--dryrun'
WAIT=0

while [ $# -gt 0 ]; do
  case "$1" in
    -f|--force)
      DRYRUN=""
      ;;
    --version=*)
      VERSION="${1#*=}"
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

JSON=$(aws --profile dev-frontend                            \
  cloudfront create-invalidation                             \
    --distribution-id E1F7ECRVBF3EX2                         \
    --paths /sdk/${VERSION}/td.js /sdk/${VERSION}/td.min.js  \
    ${DRYRUN}                                                \
    --region 'us-east-2')

INVALIDATION_ID=$(echo $JSON | jq -r '.Invalidation.Id')
echo Created Invalidation: $INVALIDATION_ID

if [ $WAIT -eq 1 ]; then
  echo "Waiting until invalidation complete"
  ./bin/check-invalidation.sh --id=$INVALIDATION_ID
fi
