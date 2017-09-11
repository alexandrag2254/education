// nodejs server setup 

// call the packages we need
var express     = require('express');        // call express
var app         = express();                 // define our app using express
var bodyParser  = require('body-parser');
var http        = require('http')
var fs          = require('fs');
var hfc 		= require('fabric-client');
var path 		= require('path');
var util 		= require('util');

// Load all of our middleware
// configure app to use bodyParser()
// this will let us get the data from a POST
// app.use(express.static(__dirname + '/client'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// instantiate the app
var app = express();

// set up a static file server that points to the "client" directory
app.use(express.static(path.join(__dirname, './client')));

app.get('/all_tuna', function(req, res) {
	console.log("getting all tuna from database: ")

	var options = {
	    wallet_path: path.join(__dirname, './creds'),
	    user_id: 'PeerAdmin',
	    channel_id: 'mychannel',
	    chaincode_id: 'tuna-app',
	    network_url: 'grpc://localhost:7051',
	};

	var channel = {};
	var client = null;

	Promise.resolve().then(() => {
	    console.log("Create a client and set the wallet location");
	    client = new hfc();
	    return hfc.newDefaultKeyValueStore({ path: options.wallet_path });
	}).then((wallet) => {
	    console.log("Set wallet path, and associate user ", options.user_id, " with application");
	    client.setStateStore(wallet);
	    return client.getUserContext(options.user_id, true);
	}).then((user) => {
	    console.log("Check user is enrolled, and set a query URL in the network");
	    if (user === undefined || user.isEnrolled() === false) {
	        console.error("User not defined, or not enrolled - error");
	    }
	    channel = client.newChannel(options.channel_id);
	    channel.addPeer(client.newPeer(options.network_url));
	    return;
	}).then(() => {
	    console.log("Make query");
	    var transaction_id = client.newTransactionID();
	    console.log("Assigning transaction_id: ", transaction_id._transaction_id);

	    // queryAllTuna - requires no arguments , ex: args: [''],
	    const request = {
	        chaincodeId: options.chaincode_id,
	        txId: transaction_id,
	        fcn: 'queryAllTuna',
	        args: ['']
	    };
	    return channel.queryByChaincode(request);
	}).then((query_responses) => {
	    console.log("returned from query");
	    if (!query_responses.length) {
	        console.log("No payloads were returned from query");
	    } else {
	        console.log("Query result count = ", query_responses.length)
	    }
	    if (query_responses[0] instanceof Error) {
	        console.error("error from query = ", query_responses[0]);
	    }
	    
	    console.log("Response is ", query_responses[0].toString());

	    res.json(JSON.parse(query_responses[0].toString()));

	}).catch((err) => {
	    console.error("Caught Error", err);
	});

});

app.get('/query_tuna/:id', function(req, res) {
	console.log("querying a specific tuna catch: ")

	var options = {
	    wallet_path: path.join(__dirname, './creds'),
	    user_id: 'PeerAdmin',
	    channel_id: 'mychannel',
	    chaincode_id: 'tuna-app',
	    network_url: 'grpc://localhost:7051',
	};

	var channel = {};
	var client = null;

	Promise.resolve().then(() => {
	    console.log("Create a client and set the wallet location");
	    client = new hfc();
	    return hfc.newDefaultKeyValueStore({ path: options.wallet_path });
	}).then((wallet) => {
	    console.log("Set wallet path, and associate user ", options.user_id, " with application");
	    client.setStateStore(wallet);
	    return client.getUserContext(options.user_id, true);
	}).then((user) => {
	    console.log("Check user is enrolled, and set a query URL in the network");
	    if (user === undefined || user.isEnrolled() === false) {
	        console.error("User not defined, or not enrolled - error");
	    }
	    channel = client.newChannel(options.channel_id);
	    channel.addPeer(client.newPeer(options.network_url));
	    return;
	}).then(() => {
	    console.log("Make query");
	    var transaction_id = client.newTransactionID();
	    console.log("Assigning transaction_id: ", transaction_id._transaction_id);
	    id = "TUNA" + req.params.id;
	    // queryTuna - requires 1 argument, ex: args: ['TUNA4'],
	    const request = {
	        chaincodeId: options.chaincode_id,
	        txId: transaction_id,
	        fcn: 'queryTuna',
	        args: [id]
	    };
	    return channel.queryByChaincode(request);
	}).then((query_responses) => {
	    console.log("returned from query");
	    if (!query_responses.length) {
	        console.log("No payloads were returned from query");
	    } else {
	        console.log("Query result count = ", query_responses.length)
	    }
	    if (query_responses[0] instanceof Error) {
	        console.error("error from query = ", query_responses[0]);
	    }
	    console.log("Response is ", query_responses[0].toString());
		 res.json(JSON.parse(query_responses[0].toString()));

	}).catch((err) => {
	    console.error("Caught Error", err);
	});

});

app.get('/change_holder/:holder', function(req, res) {
	console.log("changing holder of tuna catch: ");

	array = req.params.holder
	var holder = array.split("-");
	console.log(holder)

	var options = {
	    wallet_path: path.join(__dirname, './creds'),
	    user_id: 'PeerAdmin',
	    channel_id: 'mychannel',
	    chaincode_id: 'tuna-app',
	    peer_url: 'grpc://localhost:7051',
	    event_url: 'grpc://localhost:7053',
	    orderer_url: 'grpc://localhost:7050'
	};

	var channel = {};
	var client = null;
	var targets = [];
	var tx_id = null;
	Promise.resolve().then(() => {
	    console.log("Create a client and set the wallet location");
	    client = new hfc();
	    return hfc.newDefaultKeyValueStore({ path: options.wallet_path });
	}).then((wallet) => {
	    console.log("Set wallet path, and associate user ", options.user_id, " with application");
	    client.setStateStore(wallet);
	    return client.getUserContext(options.user_id, true);
	}).then((user) => {
	    console.log("Check user is enrolled, and set a query URL in the network");
	    if (user === undefined || user.isEnrolled() === false) {
	        console.error("User not defined, or not enrolled - error");
	    }
	    channel = client.newChannel(options.channel_id);
	    var peerObj = client.newPeer(options.peer_url);
	    channel.addPeer(peerObj);
	    channel.addOrderer(client.newOrderer(options.orderer_url));
	    targets.push(peerObj);
	    return;
	}).then(() => {
	    tx_id = client.newTransactionID();
	    console.log("Assigning transaction_id: ", tx_id._transaction_id);
	   
	    // changeTunaHolder - requires 2 args , ex: args: ['TUNA01', 'Barry'],
	    // send proposal to endorser
	    var request = {
	        targets: targets,
	        chaincodeId: options.chaincode_id,
	        fcn: 'changeTunaHolder',
	        args: ['TUNA'+holder[0], holder[1]],
	        chainId: options.channel_id,
	        txId: tx_id
	    };
	    return channel.sendTransactionProposal(request);
	}).then((results) => {
	    var proposalResponses = results[0];
	    var proposal = results[1];
	    var header = results[2];
	    let isProposalGood = false;
	    if (proposalResponses && proposalResponses[0].response &&
	        proposalResponses[0].response.status === 200) {
	        isProposalGood = true;
	        console.log('transaction proposal was good');
	    } else {
	        console.error('transaction proposal was bad');
	    }
	    if (isProposalGood) {
	        console.log(util.format(
	            'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
	            proposalResponses[0].response.status, proposalResponses[0].response.message,
	            proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
	        var request = {
	            proposalResponses: proposalResponses,
	            proposal: proposal,
	            header: header
	        };
	        // set the transaction listener and set a timeout of 30sec
	        // if the transaction did not get committed within the timeout period,
	        // fail the test
	        var transactionID = tx_id.getTransactionID();
	        var eventPromises = [];
	        let eh = client.newEventHub();
	        eh.setPeerAddr(options.event_url);
	        eh.connect();

	        let txPromise = new Promise((resolve, reject) => {
	            let handle = setTimeout(() => {
	                eh.disconnect();
	                reject();
	            }, 30000);

	            eh.registerTxEvent(transactionID, (tx, code) => {
	                clearTimeout(handle);
	                eh.unregisterTxEvent(transactionID);
	                eh.disconnect();

	                if (code !== 'VALID') {
	                    console.error(
	                        'The transaction was invalid, code = ' + code);
	                    reject();
	                } else {
	                    console.log(
	                        'The transaction has been committed on peer ' +
	                        eh._ep._endpoint.addr);
	                    resolve();
	                }
	            });
	        });
	        eventPromises.push(txPromise);
	        var sendPromise = channel.sendTransaction(request);
	        return Promise.all([sendPromise].concat(eventPromises)).then((results) => {
	            console.log(' event promise all complete and testing complete');
	            return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
	        }).catch((err) => {
	            console.error(
	                'Failed to send transaction and get notifications within the timeout period.'
	            );
	            return 'Failed to send transaction and get notifications within the timeout period.';
	        });
	    } else {
	        console.error(
	            'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...'
	        );
	        return 'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...';
	    }
	}, (err) => {
	    console.error('Failed to send proposal due to error: ' + err.stack ? err.stack :
	        err);
	    return 'Failed to send proposal due to error: ' + err.stack ? err.stack :
	        err;
	}).then((response) => {
	    if (response.status === 'SUCCESS') {
	        console.log('Successfully sent transaction to the orderer.');
	        // return tx_id.getTransactionID();
	        res.json(tx_id.getTransactionID())
	    } else {
	        console.error('Failed to order the transaction. Error code: ' + response.status);
	        return 'Failed to order the transaction. Error code: ' + response.status;
	    }
	}, (err) => {
	    console.error('Failed to send transaction due to error: ' + err.stack ? err
	        .stack : err);
	    return 'Failed to send transaction due to error: ' + err.stack ? err.stack :
	        err;
	});

});

app.get('/record_tuna/:tuna', function(req, res) {
	console.log("submit recording of a tuna catch: ");
	array = req.params.tuna
	var tuna = array.split("-");

	var options = {
	    wallet_path: path.join(__dirname, './creds'),
	    user_id: 'PeerAdmin',
	    channel_id: 'mychannel',
	    chaincode_id: 'tuna-app',
	    peer_url: 'grpc://localhost:7051',
	    event_url: 'grpc://localhost:7053',
	    orderer_url: 'grpc://localhost:7050'
	};

	var channel = {};
	var client = null;
	var targets = [];
	var tx_id = null;
	Promise.resolve().then(() => {
	    console.log("Create a client and set the wallet location");
	    client = new hfc();
	    return hfc.newDefaultKeyValueStore({ path: options.wallet_path });
	}).then((wallet) => {
	    console.log("Set wallet path, and associate user ", options.user_id, " with application");
	    client.setStateStore(wallet);
	    return client.getUserContext(options.user_id, true);
	}).then((user) => {
	    console.log("Check user is enrolled, and set a query URL in the network");
	    if (user === undefined || user.isEnrolled() === false) {
	        console.error("User not defined, or not enrolled - error");
	    }
	    channel = client.newChannel(options.channel_id);
	    var peerObj = client.newPeer(options.peer_url);
	    channel.addPeer(peerObj);
	    channel.addOrderer(client.newOrderer(options.orderer_url));
	    targets.push(peerObj);
	    return;
	}).then(() => {
	    tx_id = client.newTransactionID();
	    console.log("Assigning transaction_id: ", tx_id._transaction_id);
	   
	    // recordTuna - requires 7 args, ID, vessel, location, timestamp,holder 
	    // send proposal to endorser

	    var request = {
	        targets: targets,
	        chaincodeId: options.chaincode_id,
	        fcn: 'recordTuna',
	        args: [tuna[0], tuna[2], tuna[3], tuna[4], tuna[1]],
	        chainId: options.channel_id,
	        txId: tx_id
	    };
	    return channel.sendTransactionProposal(request);
	}).then((results) => {
	    var proposalResponses = results[0];
	    var proposal = results[1];
	    var header = results[2];
	    let isProposalGood = false;
	    if (proposalResponses && proposalResponses[0].response &&
	        proposalResponses[0].response.status === 200) {
	        isProposalGood = true;
	        console.log('transaction proposal was good');
	    } else {
	        console.error('transaction proposal was bad');
	    }
	    if (isProposalGood) {
	        console.log(util.format(
	            'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
	            proposalResponses[0].response.status, proposalResponses[0].response.message,
	            proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
	        var request = {
	            proposalResponses: proposalResponses,
	            proposal: proposal,
	            header: header
	        };
	        // set the transaction listener and set a timeout of 30sec
	        // if the transaction did not get committed within the timeout period,
	        // fail the test
	        var transactionID = tx_id.getTransactionID();
	        var eventPromises = [];
	        let eh = client.newEventHub();
	        eh.setPeerAddr(options.event_url);
	        eh.connect();

	        let txPromise = new Promise((resolve, reject) => {
	            let handle = setTimeout(() => {
	                eh.disconnect();
	                reject();
	            }, 30000);

	            eh.registerTxEvent(transactionID, (tx, code) => {
	                clearTimeout(handle);
	                eh.unregisterTxEvent(transactionID);
	                eh.disconnect();

	                if (code !== 'VALID') {
	                    console.error(
	                        'The transaction was invalid, code = ' + code);
	                    reject();
	                } else {
	                    console.log(
	                        'The transaction has been committed on peer ' +
	                        eh._ep._endpoint.addr);
	                    resolve();
	                }
	            });
	        });
	        eventPromises.push(txPromise);
	        var sendPromise = channel.sendTransaction(request);
	        return Promise.all([sendPromise].concat(eventPromises)).then((results) => {
	            console.log(' event promise all complete and testing complete');
	            return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
	        }).catch((err) => {
	            console.error(
	                'Failed to send transaction and get notifications within the timeout period.'
	            );
	            return 'Failed to send transaction and get notifications within the timeout period.';
	        });
	    } else {
	        console.error(
	            'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...'
	        );
	        return 'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...';
	    }
	}, (err) => {
	    console.error('Failed to send proposal due to error: ' + err.stack ? err.stack :
	        err);
	    return 'Failed to send proposal due to error: ' + err.stack ? err.stack :
	        err;
	}).then((response) => {
	    if (response.status === 'SUCCESS') {
	        console.log('Successfully sent transaction to the orderer.');
	        return tx_id.getTransactionID();
	    } else {
	        console.error('Failed to order the transaction. Error code: ' + response.status);
	        return 'Failed to order the transaction. Error code: ' + response.status;
	    }
	}, (err) => {
	    console.error('Failed to send transaction due to error: ' + err.stack ? err
	        .stack : err);
	    return 'Failed to send transaction due to error: ' + err.stack ? err.stack :
	        err;
	});



});

// Save our port
var port = process.env.PORT || 8000;

// Start the server and listen on port 
app.listen(port,function(){
  console.log("Live on port: " + port);
});












