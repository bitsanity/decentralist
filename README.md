# decentralist
A decentralized publishing system.

This system enables anyone to publish text or an image url without constraint. No censorship possible.

There is an Ethereum mainnet smartcontract <a href="https://etherscan.io/address/0x05ebfb4f0d74eeb7b3aa9bfd426a80518a1686f7">here</a> with published and verified source code and an Abstract Binary Interface (ABI) so anyone can inspect it and use it.

Posters call the postText() and postImage() functions on the smartcontract. Posters pay transaction gas and a fee generally around $1 to the smartcontract itself in order to publish. The fee encourages posters to consider their motives and resources more carefully.

Posts include locale and category fields that can be anything the poster wishes.

This publishing engine picks up posts with specific locales (AMS BER ... YVR, GLOBAL, MATRIX) and categories (Animals, Boats, ... Vehicles, XXX). Other publishing engines could use other schemes as they wish to select posts for their particular audience. For example, using a locale of "Italy" and categories (Food, Wine, Art, ...).

Posts include a BUYING, SELLING or NOTICE type.

This particular publishing engine converts posts from the smartcontract to a set of simple html web pages at the start of each day, fetching posts from the previous calendar day.

This engine renders the first 320 characters of each text post into a standard-size image.
This engine fetches posted images and resizes them to the same standard size as text posts.
This engine places posts in BUYING, SELLING and NOTICE columns.
This engine prioritizes posts by how much was paid to the smartcontract - highest payers at the top.
