#!/bin/sh
# Assemble main.js from the parts and run the tests (needs only node).
cd "$(dirname "$0")" || exit 1
cat header.js neutral.js en.js ru.js core.js > new-main.js && node --check new-main.js || exit 1
export NODE_PATH="$PWD/mock/node_modules"
node test-rank.js new-main.js && node test-user.js && cp new-main.js ../main.js && echo "main.js updated"
