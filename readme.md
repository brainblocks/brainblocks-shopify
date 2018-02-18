# Nano Shopify
An unofficial NodeJS project for accepting [Nano](https://nano.org) cryptocurrency on your Shopify store.

Powered by [BrainBlocks](https://brainblocks.io).

## Donate
If you find this useful you can donate Nano to this address:  
`xrb_3myw9br787znt1cfyj3dqmnynrat9b9m9w3en75cj5anwyy1dqbft3py8ef3`

## How It Works
1. You launch this project on a new website
2. You add a custom payment option that tells customers to go to that website
3. Customer enters their total cart amount on that site
4. Customer pays with Nano
5. Customer is given a Shopify discount code that gives them 100% their order
5. Customer returns to your shop and finishes their checkout

## Caveats and Warnings
Customers have to go to an external site to pay.  
Because Shopify does not allow HTML in custom payment instructions, customers will have to copy and paste the URL.  
Customers have to enter in their cart totals manually.

## Requirements
 - NodeJS
 - MongoDB

# Installation

## Create Private Shopify App
 - Navigate to `https://YOUR-STORE.myshopify.com/admin/apps/private/new`
 - Give it a name
 - In the **Admin API** section click **Review disabled Admin API permissions**
 - Set **Price rules** to "Read and Write"
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
In **Additional details** modify and paste the following: 
```
1) Go here: URL_WHERE_YOU_ARE_RUNNING_THIS_APP

2) Enter in your total amount, including taxes and shipping

3) Pay with Nano

4) Copy the provided discount code from that page

5) Apply that discount here
```

# Customization
You can modify the CSS in `views/pay.pug`  
You can modify the header and footer in the `views/partials/` folder
