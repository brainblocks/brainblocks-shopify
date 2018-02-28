# BrainBlocks Shopify
A NodeJS project for accepting [Nano](https://nano.org) cryptocurrency on Shopify.

Powered by [BrainBlocks](https://brainblocks.io). Developed by Vindexus.

## Requirements
 - NodeJS
 - MongoDB

# Installation
## Set Up the Server
`git clone https://github.com/brainblocks/brainblocks-shopify.git`  
`cd brainblocks-shopify`  
`npm install`

## Fill Out Config

`port`: Port to run the server on. Ex `4800`  
`mongodbURI`: The connection URI for mongoose to connect to. Ex: `mongodb://localhost/nano-shopify`

## Set Your Encryption Key

Se the env variable `ENCRYPTION_KEY` to a 32 character string. This is used to encrypt/decrypt Shopify
 API credentials in the database.

## Run the Server
Start your server with `npm start`

## Register Shops
Navigate to the app's homepage and fill out the form.

## Donate
If you find this useful you can donate Nano to this address:  
`xrb_3myw9br787znt1cfyj3dqmnynrat9b9m9w3en75cj5anwyy1dqbft3py8ef3`
