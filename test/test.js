const Tambola = artifacts.require("Tambola");
const Multicall2 = artifacts.require("Multicall2");
var fs = require('fs');
var util = require('util');
const {BigNumber} = require("@ethersproject/bignumber");
var log_file = fs.createWriteStream(__dirname + '/debug2.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

var prizeName = ['TOP_ROW',
    'MIDDLE_ROW',
    'BOTTOM_ROW',
    'FULL_HOUSE_1',
    'FULL_HOUSE_2',
    'FULL_HOUSE_3',
    'FASTEST_FIVE',
    'CORNERS',
    'CENTER',
    'BREAKFAST',
    'LUNCH',
    'DINNER'
]

contract("Tambola test", async accounts => {
    it("should not throw an error", async () => {
        let owner = accounts[9]
        async function printBalances() {
            console.log("Owner: " + await web3.eth.getBalance(owner));
            console.log("Host: " + await web3.eth.getBalance(accounts[0]));
            for(let i = 1; i <=3; i++) {
                console.log("Player " + i + ": " + await web3.eth.getBalance(accounts[i]));
            }

        }

        function printGasCost(gasUsed, reason) {
            let gasPrice = 40 / 10**9;
            let gasInNative = gasUsed * gasPrice;
            console.log(reason + "- Gas units: " + gasUsed + ", Gas native: " + gasInNative + ", Gas USD: " + (gasInNative * 1.9));
        }
        // let multicall = await Multicall2.deployed();
        // await debug(multicall.aggregate([['0xa76Db0A48d9d8F494eb41BDa8e259866f14eF4b8',
        //     '0x8816ae07000000000000000000000000b7afb8386f68906868b47a03afe3bfcd3168250d'],
        //     ['0xa76Db0A48d9d8F494eb41BDa8e259866f14eF4b8',
        //         '0x3ea7ea33000000000000000000000000b7afb8386f68906868b47a03afe3bfcd3168250d0000000000000000000000000000000000000000000000000000000000000000']]
        // , {from: accounts[0]}));
        let result;
        await printBalances()
        let hostGasUsed = 0;
        let ticketCost = BigNumber.from(10).pow(17);
        // web3.eth.sendTransaction({to:accounts[1], from:accounts[0], value: web3.utils.toWei('1')})
        let tambola = await Tambola.deployed();
        result = await tambola.hostGame(ticketCost, {from: accounts[0], value: ticketCost});
        printGasCost(result.receipt.gasUsed, 'Host Game')
        hostGasUsed += result.receipt.gasUsed;
        // console.log(await tambola.getPrizesStatus(accounts[0]));
        result = await debug(tambola.buyTicket(accounts[0], 0, {from: accounts[1], value: ticketCost, gas: 500000}));
        printGasCost(result.receipt.gasUsed, 'Buy Ticket Player 1')
        // await tambola.getTicket(accounts[0], {from: accounts[1]});
        result = await tambola.buyTicket(accounts[0], 0,{from: accounts[2], value: ticketCost, gas: 500000});
        printGasCost(result.receipt.gasUsed, 'Buy Ticket Player 2')
        result = await tambola.buyTicket(accounts[0], 0,{from: accounts[3], value: ticketCost, gas: 500000});
        printGasCost(result.receipt.gasUsed, 'Buy Ticket Player 3')
        // console.log(await tambola.getTicket(accounts[0], accounts[1], {from: accounts[1]}));
        // console.log(await tambola.getTicket(accounts[0], accounts[2], {from: accounts[2]}));
        // console.log(await tambola.getTicket(accounts[0], accounts[3], {from: accounts[3]}));
        while(true) {
            try {
                result = await tambola.generateNext(0, {gas: 100000});
                printGasCost(result.receipt.gasUsed, 'Generate Number')
                hostGasUsed += result.receipt.gasUsed;
                // console.log(await tambola.games(accounts[0]).remainingNumbers);
            }
            catch(error) {
                console.log("Game finished: " + error.message);
                break;
            }
        }
        // await web3.currentProvider.send({method: "evm_increaseTime", params: [86400]}, () => {});
        // await tambola.endGame();
        for(i = 1; i <=3; i++) {
            for(j = 0; j <=11; j++) {
                try {
                    result = await tambola.claimPrize(accounts[0], j, {from: accounts[i]});
                    printGasCost(result.receipt.gasUsed, "Claim Prize " + j)
                    console.log(prizeName[j] + " claimed by player " + String(i));
                    // console.log(await tambola.getPrizesStatus(accounts[0]));
                }
                catch(error) {
                    // await debug(tambola.claimPrize(accounts[0], j, {from: accounts[i]}));
                    // errors.concat(String(i) + ":" + String(j) + " " + error.message + "\n");
                    // console.log(String(i) + ":" + String(j) + " " + error.message + "\n");
                }
            }      
        }
        await printBalances()
        // console.log(await tambola.getPrizesStatus(accounts[0]));
        result = await tambola.endGame();
        printGasCost(result.receipt.gasUsed, "End Game")
        hostGasUsed += result.receipt.gasUsed;
        await printBalances()
        printGasCost(hostGasUsed, "Total Host Cost")
    });
});