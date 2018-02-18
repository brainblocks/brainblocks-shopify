# Nano Shopify
A NodeJS project for accepting [Nano](https://nano.org) cryptocurrency on your Shopify store.

Powered by [BrainBlocks](https://brainblocks.io)

## How It Works
1. You launch this project on a new website
2. You add a custom payment option that directs customers to that website
3. Customer enters their total cart amount
4. Customer pays with Nano
5. Customer is given a Shopify discount code
5. Customer returns to your shop and finishes their checkout

## Caveats and Warnings
Customers have to go to an external site to pay.  
Because Shopify does not allow HTML in custom payment instructions, customers will have to copy and paste the URL.  
Customers have to enter in their cart amounts manually.

## Requirements
 - NodeJS
 - MongoDB

## Installation

### Create Private Shopify App
 - Go to `https://YOUR-STORE.myshopify.com/admin/apps/private/new`
 - Give it a name
 - Under Admin API click **Review disabled
 - Set the **Price rules** rules to "Read and Write"
 - Set all other rules to "No access"


### Setting Up the Server
`git clone git@github.com:Vindexus/nano-shopify`

### Fill Out Config
Copy the contents of `config.example.json` to a new file named `config.json`. Fill out the following details:

`shopify.endpoint`: Ex: `https://your-store.myshopify.com/admin`
`shopify.username`: 

### Add Custom Payment Method

```
1) Go here: URL_WHERE_YOURE_RUNNING_THIS_APP

2) Enter in your total amount

3) Pay with nano

4) Copy the provided discount code from that page

5) Apply that discount here
```