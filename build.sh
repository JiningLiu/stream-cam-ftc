#!/bin/bash

USER="JiningLiu"
REPO="stream-cam-ftc"

rm -r ./.extension-build
rm $REPO.zip

vite build
cp config.json ./build/

mkdir ./.extension-build
mkdir ./.extension-build/$USER
mkdir ./.extension-build/$USER/$REPO

cp -r build/ ./.extension-build/$USER/$REPO

cd ./.extension-build
zip -vr ../$REPO.zip ./$USER
cd ..

rm -r .extension-build