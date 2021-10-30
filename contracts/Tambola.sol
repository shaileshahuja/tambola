// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;



contract Tambola {
    mapping(address => Game) public games;
    uint8 constant hostFeePercent = 3;
    address constant owner = address(0x5c2e9BaE4FE4e7710A2F1F83c521dB632F66f242);
    
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
        bool bogusPenalty;
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

    function hostGame(uint256 ticketCost, bool bogusPenalty) public {
        require(ticketCost >= 100, "Ticket cost must be at least 100");       
        address host = tx.origin;
        Game storage game = games[host];
        GameStatus status = getGameStatus(game);
        require(status == GameStatus.INVALID || canChangeTicketCost(game), "Please end the previous game before hosting another one");

        game.ticketCost = ticketCost;
        game.bogusPenalty = bogusPenalty;
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
        payable(host).transfer(hostPot);
        payable(owner).transfer(remainingPot);
        
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
        
        uint256 randomSeed = random(randomness ^ game.players.length);
        uint8[5] memory top;
        uint8[5] memory middle;
        uint8[5] memory bottom;
        (top, randomSeed) = generateColumnNumbers(randomSeed);
        (middle, randomSeed) = generateColumnNumbers(randomSeed);
        (bottom, randomSeed) = generateColumnNumbers(randomSeed);
        uint8[9] memory columnCount;
        bool[3][9] memory hasNumber;
        for(uint i = 0; i < 5; i++) {
            columnCount[top[i]]++;
            columnCount[middle[i]]++;
            columnCount[bottom[i]]++;
            hasNumber[top[i]][0] = true;
            hasNumber[middle[i]][1] = true;
            hasNumber[bottom[i]][2] = true;
        }
        for(uint i = 0; i < 9; i++) {
            assert(columnCount[i] <= 3);
        }
        uint8[3] memory column;
        uint256[3] memory rows;
        for(uint8 i = 0; i < 9; i++) {
            (column, randomSeed) = generateColumn(randomSeed, i, columnCount[i]);
            uint8[3] memory newColumn = sortColumn(column,  columnCount[i]);
            uint8 usedIndex = 0;
            uint8 row = 0;
            while(usedIndex < columnCount[i] && row < 3) {
                if (hasNumber[i][row] == true) {
                    rows[row] += 1 << (newColumn[usedIndex] - 1);
                    usedIndex++;
                }
                row++;
            }
        }
        for(uint8 i = 0; i < 3; i++) {
            ticket.rows[i] = rows[i];
        }
        ticket.active = true;
        emit TicketBought(host);
    }

    function generateColumnNumbers(uint256 rand) internal view returns (uint8[5] memory, uint256 randomSeed) {
        uint8[9] memory options = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        uint8[5] memory row;
        for(uint i = 0; i < 5; i++) {
            rand = random(rand);
            uint256 index = rand % (options.length - i);
            row[i] = options[index];
            options[index] = options[options.length - 1 - i];
        }
        return (row, rand);
    }

    function generateColumn(uint256 rand, uint8 columnNumber, uint8 limit) internal view returns (uint8[3] memory, uint256 randomSeed) {
        uint8[3] memory column;
        if (columnNumber == 0) {
            uint8[9] memory options = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            for(uint i = 0; i < limit; i++) {
                rand = random(rand);
                uint256 index = rand % (options.length - i);
                column[i] = columnNumber * 10 + options[index];
                options[index] = options[options.length - 1 - i];
            }
        }
        else if (columnNumber == 8) {
            uint8[11] memory options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            for(uint i = 0; i < limit; i++) {
                rand = random(rand);
                uint256 index = rand % (options.length - i);
                column[i] = columnNumber * 10 + options[index];
                options[index] = options[options.length - 1 - i];
            }
        }
        else {
            uint8[10] memory options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            for(uint i = 0; i < limit; i++) {
                rand = random(rand);
                uint256 index = rand % (options.length - i);
                column[i] = columnNumber * 10 + options[index];
                options[index] = options[options.length - 1 - i];
            }
        }
        return (column, rand);
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
    
    function getPrizesStatus(address host) public view returns (address[] memory){
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
            if (game.bogusPenalty == true) {
                ticket.active = false;
            }
            else {
                revert("Bogie!");
            }
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
