#!/usr/bin/env bash
set -e

# parameter $1 -> path to dir
function run_webpack
{
  local demo_dir=$1

  # if in ./src/, do it, otherwise return
  if [[ ${demo_dir} != "./src"* ]]; then
    return
  fi

  echo "Packing: ${demo_dir}"
  ./node_modules/.bin/webpack --config "${demo_dir}/webpack.config.js" --display-error-details
}

for dir in $(find . -d -regex ".*/${1+$1/}demo"*); do
    run_webpack ${dir}
done
