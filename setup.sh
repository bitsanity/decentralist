#!/bin/bash

for LOCALE in AMS BER CPT ORD DUB EDI YHW LAX MAD MEX YUL BOM NYC YTO PAR FCO YQY YVR GLOBAL MATRIX; do

mkdir webroot/$LOCALE/

for CATEGORY in Animals Boats Cannabis Community Cryptocurrencies Farm-And-Garden Finance Food General-Items Home-Rentals Home-Sales Jobs Services Sporting-Goods Vehicles XXX; do

mkdir webroot/$LOCALE/$CATEGORY

done

done

