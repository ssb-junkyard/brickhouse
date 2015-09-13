#! /usr/bin/env bash
#build all apps
mkdir -p build
for app in defaults/*; do 
  name=${app##defaults/}
  echo building $name
  noderify $app/index.js --electron > build/$name.js
done

#initialize
#node ./lib/initialize.js
