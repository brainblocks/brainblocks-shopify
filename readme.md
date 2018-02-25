# Nano Shopify
An unofficial NodeJS project for accepting [Nano](https://nano.org) cryptocurrency on your Shopify store.

Powered by [BrainBlocks](https://brainblocks.io).

## Donate
If you find this useful you can donate Nano to this address:  
`xrb_3myw9br787znt1cfyj3dqmnynrat9b9m9w3en75cj5anwyy1dqbft3py8ef3`

## How It Works
1. You launch this project on a server
2. Add a Custom payment method called "Nano"
3. Embed a JS script on the Thank you page
4. Customers select that method
5. Customers pay with Nano on the thank you page
6. Order is marked as paid


## Requirements
 - NodeJS

# Installation

## Create Private Shopify App
 - Navigate to `https://YOUR-STORE.myshopify.com/admin/apps/private/new`
 - Give it a name
 - In the **Admin API** section click **Review disabled Admin API permissions**
 - Set **Price rules** and **Orders, transactions and fulfillments** to "Read and Write"
 - Set all other rules to "No access"
 - Click the **Save** button
 - You will need the API Key and Password values later on

## Set Up the Server
`git clone git@github.com:Vindexus/nano-shopify`
`cd nano-shopify`
`npm install`

## Fill Out Config
Copy the contents of `config.example.json` to a new file named `config.json`. Fill out the following details:

`port`: Port to run the server on. Ex `4800`
`mongodbURI`: The connection URI for mongoose to connect to. Ex: `mongodb://localhost/nano-shopify`
`shopify.endpoint`: Ex: `https://your-store.myshopify.com/admin`  
`shopify.username`: Use the **API Key** of your private Shopify app  
`shopify.password`: Use the **Password** of your private Shopify app  
`destination`: The Nano address to send payment to
`currency`: The currency of your shop. Lowercase. Accepted values are the same as BrainBlocks:

>```
>aud, brl, cad, chf, clp, cny, czk, dkk, eur, gbp, hkd, huf, idr, ils, inr, jpy, krw, mxn, myr, nok, nzd, php, pkr, pln, rub, sek, sgd, thb, try, usd, twd, zar
>```

## Run the Server
Start your server with `npm start`

## Add Custom Payment Method
Navigate to `https://YOUR-STORE.myshopify.com/admin/settings/payments`  
Scroll to **Manual payments**  
Select **Create custom payment method** from the dropdown  
In **Name of the custom payment method** name put "Nano"  
Save

## Add Nano Shopify JS Script
Navigate to where you are running this project  
Copy the provided JavaScript  
Navigate to `https://YOUR-STORE.myshopify.com/admin/settings/checkout`  
Paste the code into *Additional scripts* under **Order processing**
Save