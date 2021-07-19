# Dapp Functionality
This dapp is used for creating or joining already created events were all data are stored on the Celo network blockchain.
It employs a minimalist ux design, which allows quick integration among users.

There are two types of events that can be created, 
1. Events with the option of soliciting donations from the users
2. Events without donations.
	
Each event created is linked to an event ID, which is created by the Event Creator when the event is created, to allow other users to be able to access that event.

The events can be pulled from the blockchain using the find event button.
All events are shown by aid of a modal on the user screen.

This dapps employs three types of user characters.
1. Users that have not joined an event
	- On searching for an event, the modal displays the join event modal, where they can view the details of the event and choose to join.
2. Users that have joined the event
	- For these users a different modal is shown, now depending if the event is a donation based event or a non-donation based event.
	- If it is a donation based event, they can choose to support the event.
3. Event Creators
	- For these users a different modal is shown, where they can decide to close the event, where any query will return that the event is closed for any other user.
	- It also shows the amount of donations the user has received from the event attendees.


# Usage
1. Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from the google chrome store.
2. Create a wallet.
3. Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
4. Switch to the alfajores testnet in the CeloExtensionWallet.



# Test the Dapp

```

Use already created Event IDs 
1. #Test1234
2. #Retest1234

```
Live Demo url: https://joe11-y.github.io/Event-planer-web-dapp/


## Development

# Install

```

npm install

```

or 

```

yarn install

```

# Start

```

npm run dev

```


