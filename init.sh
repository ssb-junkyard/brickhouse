#! /usr/bin/env bash
#build all apps
for app in defaults/*; do 
  echo building $app
  pushd $app
    noderify index.js --electron > app.js
  popd
done

#initialize
node ./lib/initialize.js
