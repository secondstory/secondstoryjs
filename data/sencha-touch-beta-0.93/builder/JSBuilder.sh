#!/bin/sh
UNAME="$(uname)"
ARGUMENTS=$*
DIRNAME="$(dirname $0)"
if [ $UNAME == "Darwin" ] ; then
    OS="mac"
else
    OS="linux"
fi
CMD="$DIRNAME/src/$OS/jsdb $DIRNAME/src/jsbuilder.js $ARGUMENTS"
$CMD