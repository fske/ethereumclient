const co = require("co");
const Web3 = require('web3');
const request = require('request');

const util = require('./util.js');

function EthCli(ethConfig) {
    console.info(ethConfig);
    if (!ethConfig.url) {
        throw new Error("missing eth url");
    }
    this.url = ethConfig.url;
    this.web3 = new Web3(new Web3.providers.HttpProvider(this.url));

    if (!ethConfig.contractCode) {
        throw new Errors("missing eth contract code");
    }
    this.contractCode = ethConfig.contractCode;

    if (!ethConfig.contractAbi) {
        throw new Errors("missing eth contrace abi");
    }
    this.contractAbi = ethConfig.contractAbi;
    this.contractInst = this.web3.eth.contract(ethConfig.contractAbi);

    if (!ethConfig.adminAccount) {
        throw new Errors("missing eth admin account");
    }
    this.adminAccount = ethConfig.adminAccount;

    if (!ethConfig.adminPasswd) {
        throw new Errors("missing eth admin passwd");
    }
    this.adminPasswd = ethConfig.adminPasswd;
}

EthCli.prototype.UnlockAccount = function() {
    return new Promise((resolve, reject) => {
        request({
            url:    this.url,
            json:   true,
            method: 'post',
            body: {
                jsonrpc: '2.0',
                method:  'personal_unlockAccount',
                params:  [this.adminAccount, this.adminPasswd, '0xb'],
                id:      util.GenRequestID()
            }
        }, (err, response, body) => {
            console.info("unlock account: ", response.statusCode)
            if(err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

EthCli.prototype.NewContract = function() {
    return new Promise((resolve, reject) => {
        this.contractInst.new({
            from:     this.adminAccount,
            data:     this.contractCode,
            gas:      '470000',
            gasPrice: '0'
        }, (err, contract) => {
            if(err) {
                console.info("new contract: ", err);
                reject(err);
            }
            if(contract.address) {
                console.info("new contract: ", contract.address);
                resolve(contract);
            }
        });
    });
};

EthCli.prototype.GetTx = function(txHash) {
    return new Promise((resolve, reject) => {
        this.web3.eth.getTransaction(txHash, (err, transaction) => {
            if (err) {
                reject(err);
            } else {
                resolve(transaction);
            }
        });
    });
};

EthCli.prototype.GetTxReceipt = function(txHash) {
    return new Promise((resolve, reject) => {
        this.web3.eth.getTransactionReceipt(txHash, (err, transaction) => {
            if (err) {
                reject(err);
            } else {
                resolve(transaction);
            }
        });
    });
};

EthCli.prototype.SendContractTx = function(contract, input) {
    return new Promise((resolve, reject) => {
        this.contractInst.at(contract).logger.sendTransaction(
            input,
            {
                from: this.adminAccount,
                gas: '470000',
                gasPrice: '0'
            },
            (err, tx_hash) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(tx_hash);
                }
            }
        );
    });
};

EthCli.prototype.ReadContractTx = function(contract) {
    return new Promise((resolve, reject) => {
        // 获取消息总量
        let total = parseInt(this.web3.eth.getStorageAt(contract), 16)
        console.log(total);
        let txs = [];

        this.web3.eth.contract(this.contractAbi).at(contract).Print(
            { address: contract },
            { fromBlock: "0x0", toBlock: 'latest'}
        ).watch((err, results) => {
            if (err) {
                reject(err);
            } else {
                console.log(results);
                txs.push(results);
            }
            if (txs.length === total) {
                resolve(txs);
            }
        });
    });
};

module.exports = EthCli;
