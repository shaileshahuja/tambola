// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;
import "@openzeppelin/contracts/access/Ownable.sol";


contract Tambola is Ownable {
    mapping(address => Game) public games;
    uint8 constant hostFeePercent = 3;

    enum PrizeType {
        TOP_ROW,
        MIDDLE_ROW,
        BOTTOM_ROW,
        FULL_HOUSE_1,
        FULL_HOUSE_2,
        FULL_HOUSE_3,
        FASTEST_FIVE,
        CORNERS,
        CENTER,
        BREAKFAST,
        LUNCH,
        DINNER
    }
    
    enum GameStatus {
        WAITING_FOR_HOST,
        RUNNING,
        FINISHED,
        INVALID
    }
    
    struct Game {
        uint256 finishedAt;
        uint256 ticketCost;
        mapping(address => Ticket) tickets;
        address[] players;
        uint256 remainingNumbers;
        uint256 remainingNumbersCount;
        uint256 pot;
        mapping(uint8 => address) claimedPrizes;
        uint8 remainingPrizesCount;
    }
    
    struct Ticket {
        uint256[3] rows;
        bool active;
    }
    
    struct PrizeWinner {
        address winner;
        uint winPot;
    }
    
    event NumberGenerated(address indexed _host, uint _number);
    event TicketBought(address indexed _host);
    event PrizeClaimed(address indexed _host, PrizeType _prizeType);

    
    function getPrizeAllocationPercent(PrizeType prizeType) public pure returns (uint8) {
        if (prizeType == PrizeType.FULL_HOUSE_1) {
            return 30;
        }
        if (prizeType == PrizeType.FULL_HOUSE_2) {
            return 15;
        }
        return 5;
    }

    function hostGame(uint256 ticketCost) public payable{
        require(ticketCost >= 1000000, "Ticket cost must be at least 1000000");
        require(msg.value == ticketCost, "Funds equal to ticket cost must be sent as collateral");
        address host = tx.origin;
        Game storage game = games[host];
        GameStatus status = getGameStatus(game);
        require(status == GameStatus.INVALID || canChangeTicketCost(game), "Please end the previous game before hosting another one");

        game.ticketCost = ticketCost;
        game.remainingNumbers = (1 << 90) - 1;
        game.remainingPrizesCount = 12;
        game.remainingNumbersCount = 90;
    }

    function generateNext() public returns (uint256) {
        return generateNext(0);
    }
    
    function generateNext(uint randomness) public returns (uint256) {
        address host = tx.origin;
        Game storage game = games[host];
        GameStatus status = getGameStatus(game);
        require(status == GameStatus.WAITING_FOR_HOST || status == GameStatus.RUNNING, "Game not yet available to generate numbers");

        uint256 remainingNumbers = game.remainingNumbers;
        uint256 unSetAt = (random(randomness ^ uint160(host)) % game.remainingNumbersCount);
        uint256 index = 0;
        for(uint i = 0; i < 90; i++) {
            if (remainingNumbers & (1 << i) > 0) {
                if (index == unSetAt) {
                    uint256 mask = ~(1 << i);
                    game.remainingNumbersCount--;
                    game.remainingNumbers = remainingNumbers & mask;
                    if(game.remainingNumbers == 0) {
                        game.finishedAt = block.timestamp;
                    }
                    emit NumberGenerated(host, i + 1);
                    return i + 1;
                }
                index++;
            }
        }
        return 0;
    }
    
    function endGame() public {
        address host = tx.origin;
        Game storage game = games[host];
        GameStatus status = getGameStatus(game);     
        require(status == GameStatus.FINISHED, "Game hasn't finished yet");
        
        uint remainingPot = game.pot;
        PrizeWinner[12] memory winnings;
        for(uint8 i = 0; i <= uint8(PrizeType.DINNER); i++) {
            PrizeType prizeType = PrizeType(i);
            address winner = game.claimedPrizes[i];
            game.claimedPrizes[i] = address(0);
            if (winner != address(0)) {
                uint8 prizePercent = getPrizeAllocationPercent(prizeType);
                uint256 winPot = game.pot * prizePercent / 100;
                remainingPot -= winPot;
                for(uint j = 0; j < winnings.length; j++) {
                    if(winnings[j].winner == address(0)) {
                        winnings[j].winner = winner;
                        winnings[j].winPot = winPot;
                        break;
                    }
                    if(winnings[j].winner == winner) {
                        winnings[j].winPot += winPot;
                        break;
                    }
                }
            }
        }
        for(uint j = 0; j < winnings.length; j++) {
            if(winnings[j].winner == address(0)) {
                break;
            }
            payable(winnings[j].winner).transfer(winnings[j].winPot);
        }
        uint256 hostPot = game.pot * hostFeePercent / 100;
        remainingPot -= hostPot;
        payable(host).transfer(hostPot + game.ticketCost);
        payable(owner()).transfer(remainingPot);
        
        for(uint i = 0; i < game.players.length; i++) {
            address player = game.players[i];
            game.tickets[player].active = false;
        }
        delete game.players;
        game.ticketCost = 0;
        game.remainingNumbers = 0;
        game.remainingNumbersCount = 0;
        game.pot = 0;
        game.remainingPrizesCount = 0;
        game.finishedAt = 0;
    }
    
    function getGameStatus(Game storage game) internal view returns (GameStatus){
        if (game.ticketCost == 0) {
            return GameStatus.INVALID;
        }
        if (game.remainingNumbersCount == 90) {
            return GameStatus.WAITING_FOR_HOST;
        }
        if (game.remainingPrizesCount == 0) {
            return GameStatus.FINISHED;
        }
        if (game.remainingNumbersCount > 0) {
            return GameStatus.RUNNING;
        }
        if (block.timestamp > game.finishedAt + 1 days) {
            return GameStatus.FINISHED;
        }
        return GameStatus.RUNNING;
    }
    
    function canChangeTicketCost(Game storage game) internal view returns (bool){
        return game.players.length == 0;
    }
    
    function buyTicket(address host) public payable{
        buyTicket(host, 0);
    }
    
    function buyTicket(address host, uint randomness) public payable{
        Game storage game = games[host];
        GameStatus status = getGameStatus(game);        
        require(status == GameStatus.WAITING_FOR_HOST, "Game not ready");
        require(msg.value == game.ticketCost, "Incorrect funds sent to buy ticket");
        address player = tx.origin;
        Ticket storage ticket = game.tickets[player];
        require(ticket.active == false, "Ticket already purchased");
        
        game.players.push(player);
        game.pot += msg.value;
        
        uint256 rand = random(randomness ^ game.players.length);
        ticket.rows = generateTicket(rand);
        ticket.active = true;
        emit TicketBought(host);
    }


    function generateTicket(uint256 rand) internal view returns (uint[3] memory) {
        uint8[9] memory columnCounts;
        bool[3][9] memory ticketStructure;
        (columnCounts, rand) = generateColumnCounts(rand);
        (ticketStructure, rand) = generateTicketStructure(columnCounts, rand);
        uint[3] memory rows;
        uint8[3] memory column;
        for(uint8 i = 0; i < 9; i++) {
            (column, rand) = generateColumn(rand, i, columnCounts[i]);
            column = sortColumn(column,  columnCounts[i]);
            uint8 usedCount = 0;
            uint8 row = 0;
            while(usedCount < columnCounts[i] && row < 3) {
                if (ticketStructure[i][row] == true) {
                    rows[row] += 1 << (column[usedCount] - 1);
                    usedCount++;
                }
                row++;
            }
        }
        return rows;
    }

    function generateTicketStructure(uint8[9] memory columnCounts, uint256 rand) internal view returns (bool[3][9] memory, uint) {
        bool[3][9] memory ticketStructure;
        uint8 triples = 0;
        for(uint8 i=0; i <=8; i++) {
            if(columnCounts[i] == 3) {
                triples += 1;
                for(uint8 j=0; j<=2; j++) {
                    ticketStructure[i][j] = true;
                }
            }
        }
        assert(triples <= 3);
        uint8[] memory doubleOptions = new uint8[](12);
        uint length;
        if(triples == 0 || triples == 2) {
            for(uint8 i=0; i <=2; i++) {
                doubleOptions[i] = i;
                doubleOptions[i + 3] = i;
            }
            length = 6;
        }
        else if(triples == 1) {
            for(uint8 i=0; i <=2; i++) {
                doubleOptions[i] = i;
                doubleOptions[i + 3] = i;
                doubleOptions[i + 6] = i;
                doubleOptions[i + 9] = i;
            }
            length = 12;
        }
        else {
            length = 0;
        }
        uint8[3] memory numbersLeft = [5 - triples, 5 - triples, 5 - triples];
        uint typeSelected;
        for(uint8 i=0; i <=8; i++) {
            if(columnCounts[i] == 2) {
                (typeSelected, rand) = chooseRandom(doubleOptions, length, rand);
                length -= 1;
                if (typeSelected == 0) {
                    ticketStructure[i][0] = true;
                    ticketStructure[i][1] = true;
                    numbersLeft[0] -= 1;
                    numbersLeft[1] -= 1;
                }
                else if (typeSelected == 1) {
                    ticketStructure[i][0] = true;
                    ticketStructure[i][2] = true;
                    numbersLeft[0] -= 1;
                    numbersLeft[2] -= 1;
                }
                else {
                    ticketStructure[i][1] = true;
                    ticketStructure[i][2] = true;
                    numbersLeft[1] -= 1;
                    numbersLeft[2] -= 1;
                }
            }
        }
        for(uint8 i=0; i <=8; i++) {
            if(columnCounts[i] == 1) {
                uint index = rand % (numbersLeft[0] + numbersLeft[1] + numbersLeft[2]);
                rand = random(rand);
                if (index < numbersLeft[0]) {
                    ticketStructure[i][0] = true;
                    numbersLeft[0] -= 1;
                }
                else if (index < (numbersLeft[0] + numbersLeft[1])) {
                    ticketStructure[i][1] = true;
                    numbersLeft[1] -= 1;
                }
                else {
                    ticketStructure[i][2] = true;
                    numbersLeft[2] -= 1;
                }
            }
        }
        assert(numbersLeft[0] == 0);
        assert(numbersLeft[1] == 0);
        assert(numbersLeft[2] == 0);
        return (ticketStructure, rand);
    }

    function generateColumnCounts(uint256 rand) internal view returns (uint8[9] memory, uint256 randomSeed) {
        uint8[] memory options = new uint8[](18);
        uint8[9] memory counts;
        for(uint8 i = 0; i < 9; i++) {
            options[i] = i;
            options[i + 9] = i;
            counts[i] = 1;
        }
        uint8 index;
        for(uint i = 0; i < 6; i++) {
            (index, rand) = chooseRandom(options, options.length - i, rand);
            counts[index] += 1;
        }
        return (counts, rand);
    }
    
    function generateColumn(uint256 rand, uint8 columnNumber, uint8 limit) internal view returns (uint8[3] memory, uint256 randomSeed) {
        uint8[3] memory column;
        uint8[] memory options = new uint8[](11);
        uint8 start = 0;
        uint8 end = 9;
        if (columnNumber == 0) {
            start = 1;
        }
        if (columnNumber == 8) {
            end = 10;
        }
        uint length = 0;
        for(uint8 i = start; i <= end; i++) {
            options[length] = i;
            length++;
        }
        uint8 option;
        for(uint i = 0; i < limit; i++) {
            (option, rand) = chooseRandom(options, length, rand);
            column[i] = columnNumber * 10 + option;
            length--;
        }
        return (column, rand);
    }

    function chooseRandom(uint8[] memory numbers, uint length, uint rand) internal view returns (uint8, uint) {
        uint256 index = rand % length;
        uint8 num = numbers[index];
        numbers[index] = numbers[length - 1];
        rand = random(rand);
        return (num, rand);
    }

    function sortColumn(uint8[3] memory column, uint limit) internal pure returns (uint8[3] memory){
        if (limit == 3) {
            uint8[3] memory newColumn;
            if (column[0] > column[1]) {
                 if (column[0] > column[2]) {
                     if(column[1] > column[2]) {
                         // 0 > 1 > 2
                         newColumn[0] = column[2];
                         newColumn[1] = column[1];
                         newColumn[2] = column[0];
                     }
                     else {
                         // 0 > 2 > 1
                         newColumn[0] = column[1];
                         newColumn[1] = column[2];
                         newColumn[2] = column[0];
                     }
                 }
                 else {
                     // 2 > 0 > 1
                     newColumn[0] = column[1];
                     newColumn[1] = column[0];
                     newColumn[2] = column[2];
                 }
            }
            else {
                 if (column[0] > column[2]) {
                     // 1 > 0 > 2
                     newColumn[0] = column[2];
                     newColumn[1] = column[0];
                     newColumn[2] = column[1];
                 }
                 else {
                     if(column[1] > column[2]) {
                         // 1 > 2 > 0
                         newColumn[0] = column[0];
                         newColumn[1] = column[2];
                         newColumn[2] = column[1];
                     }
                     else {
                         // 2 > 1 > 0
                         newColumn[0] = column[0];
                         newColumn[1] = column[1];
                         newColumn[2] = column[2];
                     }
                 }
            }
            return newColumn;
        }
        if (limit == 2 && column[0] > column[1]) {
            uint8 temp = column[1];
            column[1] = column[0];
            column[0] = temp;
        }
        return column;
    }
    
    function getPrizesStatus(address host) public view returns (address[] memory) {
        Game storage game = games[host];
        address[] memory winners = new address[](12);
        for(uint8 i = 0; i <= uint8(PrizeType.DINNER); i++) {
            winners[i] = game.claimedPrizes[i];
        }
        return winners;
    }
    
    function claimPrize(address host, PrizeType prizeType) public {
        Game storage game = games[host];
        GameStatus status = getGameStatus(game);
        require(status == GameStatus.RUNNING || status == GameStatus.FINISHED, "No prizes to claim");
        
        address player = tx.origin;
        Ticket storage ticket = game.tickets[player];
        require(ticket.active == true, "No ticket purchased");
        require(game.claimedPrizes[uint8(prizeType)] == address(0), "Prize already claimed");

        if (prizeType == PrizeType.FULL_HOUSE_1 || prizeType == PrizeType.FULL_HOUSE_2 || prizeType == PrizeType.FULL_HOUSE_3) {
            require(game.claimedPrizes[uint8(PrizeType.FULL_HOUSE_1)] != player, "You can only claim one full house");
            require(game.claimedPrizes[uint8(PrizeType.FULL_HOUSE_2)] != player, "You can only claim one full house");
            require(game.claimedPrizes[uint8(PrizeType.FULL_HOUSE_3)] != player, "You can only claim one full house");
        }
        uint256 remainingNumbers = game.remainingNumbers;
        uint256 mask = maskTicketForPrizeType(prizeType, games[host].tickets[player]);
        bool won = false;
        if (prizeType == PrizeType.FASTEST_FIVE) {
            uint256 result = mask & ~remainingNumbers;
            for(uint256 i = 0; i < 4; i++) {
                if(result == 0) {
                    break;
                }
                result = unSetRightMostBit(result);
            }
            won = result > 0;
        }
        else {
            won = mask & remainingNumbers == 0;
        }
        if (won == false) {
            revert("Bogie!");
        } else {
            game.claimedPrizes[uint8(prizeType)] = player;
            game.remainingPrizesCount--;
            emit PrizeClaimed(host, prizeType);
        }

    }
    
    function maskTicketForPrizeType(PrizeType prizeType, Ticket memory ticket) private pure returns (uint256) {
        if (prizeType == PrizeType.TOP_ROW) {
            return ticket.rows[0];
        }
        if (prizeType == PrizeType.MIDDLE_ROW) {
            return ticket.rows[1];
        }
        if (prizeType == PrizeType.BOTTOM_ROW) {
            return ticket.rows[2];
        }
        if (prizeType == PrizeType.FULL_HOUSE_1 || prizeType == PrizeType.FULL_HOUSE_2 || prizeType == PrizeType.FULL_HOUSE_3) {
            return ticket.rows[0] | ticket.rows[1] | ticket.rows[2];
        }
        if (prizeType == PrizeType.CENTER) {
            uint256 middle = ticket.rows[1];
            middle = unSetRightMostBit(middle);
            middle = unSetRightMostBit(middle);
            return onlyRightMostBit(middle);
        }
        if (prizeType == PrizeType.CORNERS) {
            uint256 topRightCorner = onlyRightMostBit(ticket.rows[0]);
            uint256 bottomRightCorner = onlyRightMostBit(ticket.rows[2]);
            uint256 topLeftCorner = onlyLeftMostBit(ticket.rows[0]);
            uint256 bottomLeftCorner = onlyLeftMostBit(ticket.rows[2]);
            return topRightCorner | topLeftCorner | bottomLeftCorner | bottomRightCorner;
        }
        if (prizeType == PrizeType.BREAKFAST) {
            uint256 all = ticket.rows[0] | ticket.rows[1] | ticket.rows[2];
            uint256 mask = (1 << 29) - 1; // 1 - 29
            return all & mask;
        }
        if (prizeType == PrizeType.LUNCH) {
            uint256 all = ticket.rows[0] | ticket.rows[1] | ticket.rows[2];
            uint256 mask = ((1 << 59) - 1) ^ ((1 << 29) - 1); // 30 - 59
            return all & mask;
        }
        if (prizeType == PrizeType.DINNER) {
            uint256 all = ticket.rows[0] | ticket.rows[1] | ticket.rows[2];
            uint256 mask = ((1 << 90) - 1) ^ ((1 << 59) - 1); // 60 - 90
            return all & mask;
        }
        if (prizeType == PrizeType.FASTEST_FIVE) {
            return ticket.rows[0] | ticket.rows[1] | ticket.rows[2];
        }
        return (1 << 90) - 1;
    }
    
    function unSetRightMostBit(uint256 num) internal pure returns (uint256) {
        return num & (num - 1);
    }
    
    function onlyRightMostBit(uint256 num) internal pure returns (uint256) {
        return num ^ (num & (num - 1));
    }
    
    function onlyLeftMostBit(uint256 num) internal pure returns (uint256) {
        num |= num>>1;
        num |= num>>2;
        num |= num>>4;
        num |= num>>8;
        num |= num>>16;
        num |= num>>32;
        num |= num>>64;
        num |= num>>128;
        num += 1;
        return num >> 1;
    }
    
    function random(uint seed) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.number, seed)));
    }

    function getTicket(address host, address player) public view returns (Ticket memory) {
        Game storage game = games[host];
        return game.tickets[player];
    }
}
