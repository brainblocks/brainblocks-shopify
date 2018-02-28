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

## Create the Config File
Copy the `config.example.json` file to a new a file called `config.json`. Edit the new file with your desired config.

`port`: Port to run the server on. Ex `4800`  
`mongodbURI`: The connection URI for mongoose to connect to. Ex: `mongodb://localhost/brainblocks-shopify`  
`encryptionKey` A random 32 character string. This is used to encrypt/decrypt Shopify API credentials in the database. You can generate one [here](https://www.browserling.com/tools/random-string). This key should not change. If it does, all existing shops will need to re-register.

## Run the Server
Start your server with `npm start`

## Register Shops
Navigate to the app's homepage and fill out the form.

## Donate
If you find this useful you can donate Nano to this address:  
`xrb_3myw9br787znt1cfyj3dqmnynrat9b9m9w3en75cj5anwyy1dqbft3py8ef3`
