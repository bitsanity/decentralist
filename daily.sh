#!/bin/bash

#
# Run at start of each day N to build pages for yesterday N-1
#

export FONTCONFIG_PATH=/etc/fonts
export SCA='0x05ebFb4F0d74EeB7b3AA9BFD426A80518a1686f7'
node preprinter.js $SCA

export TODAY=`date -d "yesterday 13:00" '+%Y%m%d'`

for LOCALE in AMS BER CPT ORD DUB EDI YHW LAX MAD MEX YUL NYC YTO PAR FCO YQY YVR GLOBAL MATRIX; do

for CATEGORY in Animals Boats Cannabis Community Cryptocurrencies Farm-And-Garden Finance Food General-Items Home-Rentals Home-Sales Jobs Services Sporting-Goods Vehicles XXX; do

node makepage.js $LOCALE $CATEGORY $TODAY > ./webroot/$LOCALE/$CATEGORY/$TODAY.html
node listfiles.js $LOCALE $CATEGORY > ./webroot/$LOCALE/$CATEGORY/index.html

done

done

