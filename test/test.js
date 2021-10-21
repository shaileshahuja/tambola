const Tambola = artifacts.require("Tambola");
const Multicall2 = artifacts.require("Multicall2");
var fs = require('fs');
var util = require('util');
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
        let multicall = await Multicall2.deployed();
        await debug(multicall.aggregate([['0xa76Db0A48d9d8F494eb41BDa8e259866f14eF4b8',
            '0x8816ae07000000000000000000000000b7afb8386f68906868b47a03afe3bfcd3168250d'],
            ['0xa76Db0A48d9d8F494eb41BDa8e259866f14eF4b8',
                '0x3ea7ea33000000000000000000000000b7afb8386f68906868b47a03afe3bfcd3168250d0000000000000000000000000000000000000000000000000000000000000000']]
        , {from: accounts[0]}));

        var ticketCost = 100;
        // web3.eth.sendTransaction({to:accounts[1], from:accounts[0], value: web3.utils.toWei('1')})
        let tambola = await Tambola.deployed();
        await tambola.hostGame(ticketCost, false);
        console.log(await tambola.getPrizesStatus(accounts[0]));
        await tambola.buyTicket(accounts[0], {from: accounts[1], value: ticketCost});
        // await tambola.getTicket(accounts[0], {from: accounts[1]});
        await tambola.buyTicket(accounts[0], {from: accounts[2], value: ticketCost});
        await tambola.buyTicket(accounts[0], {from: accounts[3], value: ticketCost});
        console.log(await tambola.getTicket(accounts[0], {from: accounts[1]}));
        console.log(await tambola.getTicket(accounts[0], {from: accounts[2]}));
        console.log(await tambola.getTicket(accounts[0], {from: accounts[3]}));
        while(true) {
            try {
                await tambola.generateNext({gas: 100000});
                console.log(await tambola.getGeneratedNumbers(accounts[0]));
            }
            catch(error) {
                console.log("Game finished");
                break;
            }
            var errors = "";
        }
        await web3.currentProvider.send({method: "evm_increaseTime", params: [86400]}, () => {});
        await tambola.endGame();
        for(i = 1; i <=3; i++) {
            for(j = 0; j <=11; j++) {
                try {
                    await tambola.claimPrize(accounts[0], j, {from: accounts[i]});
                    console.log(prizeName[j] + " claimed by account " + String(i));
                    // console.log(await tambola.getPrizesStatus(accounts[0]));
                }
                catch(error) {
                    // await debug(tambola.claimPrize(accounts[0], j, {from: accounts[i]}));
                    // errors.concat(String(i) + ":" + String(j) + " " + error.message + "\n");
                    console.log(String(i) + ":" + String(j) + " " + error.message + "\n");
                }
            }      
        }
        console.log(await web3.eth.getBalance('0x5c2e9BaE4FE4e7710A2F1F83c521dB632F66f242'));
        for(i = 0; i <=3; i++) {
            console.log(await web3.eth.getBalance(accounts[i]));
        }
        console.log(await tambola.getPrizesStatus(accounts[0]));
        await tambola.endGame();
        console.log(await web3.eth.getBalance('0x5c2e9BaE4FE4e7710A2F1F83c521dB632F66f242'));
        for(i = 0; i <=3; i++) {
            console.log(await web3.eth.getBalance(accounts[i]));
        }
    });
});