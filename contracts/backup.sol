// // SPDX-License-Identifier: GPL-3.0

// pragma solidity ^0.8.4;



// contract Tambola2 {
//     mapping(address => Game) public games;
//     uint8 constant hostFeePercent = 3;
//     address constant owner = address(0x4895732895423);
    
//     enum PrizeType {
//         TOP_ROW,
//         MIDDLE_ROW,
//         BOTTOM_ROW,
//         FULL_HOUSE_1,
//         FULL_HOUSE_2,
//         FULL_HOUSE_3,
//         FASTEST_FIVE,
//         CORNERS,
//         CENTER,
//         BREAKFAST,
//         LUNCH,
//         DINNER
//     }
    
//     enum GameStatus {
//         WAITING_FOR_PLAYERS,
//         WAITING_FOR_HOST,
//         RUNNING,
//         FINISHED,
//         INVALID
//     }
    
//     struct Game {
//         uint256 ticketCost;
//         bool bogusPenalty;
//         mapping(address => Ticket) tickets;
//         address[] players;
//         uint256 remainingNumbers;
//         uint256 remainingNumbersCount;
//         uint256 pot;
//         mapping(uint8 => address) claimedPrizes;
//         uint8 remainingPrizesCount;
//     }
    
//     struct Ticket {
//         uint8[][3] numbers;
//         bool active;
//     }
    
//     function getPrizeAllocationPercent(PrizeType prizeType) public pure returns (uint8) {
//         if (prizeType == PrizeType.FULL_HOUSE_1) {
//             return 30;
//         }
//         if (prizeType == PrizeType.FULL_HOUSE_2) {
//             return 15;
//         }
//         return 5;
//     }

//     function hostGame(uint256 ticketCost, bool bogusPenalty) public {
//         require(ticketCost > 0, "Ticket cost must be positive");       
//         address host = msg.sender;
//         Game storage game = games[host];
//         GameStatus status = getGameStatus(game);
//         require(status == GameStatus.INVALID || canChangeTicketCost(game), "Please end the previous game before hosting another one");

//         game.ticketCost = ticketCost;
//         game.bogusPenalty = bogusPenalty;
//         game.remainingNumbers = (1 << 90) - 1;
//         game.remainingPrizesCount = 12;
//         game.remainingNumbersCount = 90;
//     }

//     function generateNext() public returns (uint256) {
//         address host = msg.sender;
//         Game storage game = games[host];
//         GameStatus status = getGameStatus(game);
//         require(status == GameStatus.WAITING_FOR_HOST || status == GameStatus.RUNNING, "Game not yet available to generate numbers");

//         uint256 remainingNumbers = game.remainingNumbers;
//         uint256 unSetAt = (random(remainingNumbers) % game.remainingNumbersCount);
//         uint256 index = 0;
//         for(uint i = 0; i < 90; i++) {
//             if (remainingNumbers & (1 << i) > 0) {
//                 if (index == unSetAt) {
//                     uint256 mask = ~(1 << i);
//                     game.remainingNumbersCount--;
//                     game.remainingNumbers = remainingNumbers & mask;
//                     return i + 1;
//                 }
//                 index++;
//             }
//         }
//         return 0;
//     }
    
//     function endGame() public {
//         address host = msg.sender;
//         Game storage game = games[host];
//         GameStatus status = getGameStatus(game);     
//         require(status == GameStatus.FINISHED, "Game hasn't fininshed yet");
        
//         uint256 remainingPot = game.pot;
//         for(uint8 i = 0; i <= uint8(PrizeType.DINNER); i++) {
//             PrizeType prizeType = PrizeType(i);
//             address winner = games[host].claimedPrizes[uint8(prizeType)];
//             game.claimedPrizes[uint8(prizeType)] = address(0);
//             if (winner != address(0)) {
//                 uint8 prizePercent = getPrizeAllocationPercent(prizeType);
//                 uint256 winPot = game.pot * prizePercent / 100;
//                 remainingPot -= winPot;
//                 payable(winner).transfer(winPot);
//             }
//         }
//         uint256 hostPot = game.pot * hostFeePercent / 100;
//         remainingPot -= hostPot;
//         payable(host).transfer(hostPot);
//         payable(owner).transfer(remainingPot);
        
//         for(uint i = 0; i < game.players.length; i++) {
//             address player = game.players[i];
//             game.tickets[player].active = false;
//         }
//         delete game.players;
//         game.ticketCost = 0;
//         game.remainingNumbers = 0;
//         game.remainingNumbersCount = 0;
//         game.pot = 0;
//         game.remainingPrizesCount = 0;
//     }
    

//     function getTicketReadable(address host) public view returns (string[3] memory) {
//         Game storage game = games[host];
//         GameStatus status = getGameStatus(game);
//         require(status != GameStatus.INVALID, "No game running");
        
//         address player = msg.sender;
//         Ticket storage ticket = game.tickets[player];
//         require(ticket.active == true, "No ticket purchased");
        
//         string[3] memory ticketStr;
//         ticketStr[0] = getReadableRow(ticket.rows[0]);
//         ticketStr[1] = getReadableRow(ticket.rows[1]);
//         ticketStr[2] = getReadableRow(ticket.rows[2]);
//         return ticketStr;
//     }
    
//     function getReadableRow(uint bitmask) internal pure returns (string memory) {
//         uint[5] memory numbers;
//         uint curIndex = 0;
//         for(uint i = 1; i <= 90; i++) {
//             if (bitmask & (1 << (i - 1)) > 0) {
//                 numbers[curIndex] = i;
//                 curIndex++;
//             }
//         }
//         string memory generatedStr;
//         curIndex = 0;
//         for(uint i = 0; i <= 8; i++) {
//             uint curNum;
//             if (curIndex >= numbers.length) {
//                 curNum = 91;
//             }
//             else {
//                 curNum = numbers[curIndex];
//             }
//             uint max = 10 * (i + 1);
//             if (i == 8) {
//                 max++;
//             }
//             if (curNum < max) {
//                 string memory strNum = uint2str(curNum);
//                 if (i == 0) {
//                     generatedStr = string(abi.encodePacked("  ", strNum));
//                 }
//                 else {
//                     generatedStr = string(abi.encodePacked(generatedStr, ", ", strNum));
//                 }
//                 curIndex++;
//             }
//             else {
//                 if (i == 0) {
//                     generatedStr = "   ";
//                 }
//                 else {
//                     generatedStr = string(abi.encodePacked(generatedStr, ",   "));
//                 }
//             }
//         }
//         return generatedStr;
//     }
    
//     function getGameStatus(Game storage game) internal view returns (GameStatus){
//         if (game.ticketCost == 0) {
//             return GameStatus.INVALID;
//         }
//         if (game.players.length < 3) {
//             return GameStatus.WAITING_FOR_PLAYERS;
//         }
//         if (game.remainingNumbersCount == 90) {
//             return GameStatus.WAITING_FOR_HOST;
//         }
//         if (game.remainingPrizesCount == 0) {
//             return GameStatus.FINISHED;
//         }
//         if (game.remainingNumbersCount > 0) {
//             return GameStatus.RUNNING;
//         }
//         return GameStatus.FINISHED;
//     }
    
//     function canChangeTicketCost(Game storage game) internal view returns (bool){
//         return game.players.length == 0;
//     }
    
//     function buyTicket(address host) public payable{
//         Game storage game = games[host];
//         GameStatus status = getGameStatus(game);        
//         require(status == GameStatus.WAITING_FOR_PLAYERS || status == GameStatus.WAITING_FOR_HOST, "Game not ready");
//         require(msg.value == game.ticketCost, "Incorrect funds sent to buy ticket");
//         address player = msg.sender;
//         Ticket storage ticket = game.tickets[player];
//         require(ticket.active == false, "Ticket already purchased");
        
//         game.players.push(player);
//         game.pot += msg.value;
        
//         uint256 randomSeed = random(game.players.length);
//         uint[5] memory top;
//         uint[5] memory middle;
//         uint[5] memory bottom;
//         (top, randomSeed) = generateColumnNumbers(randomSeed);
//         (middle, randomSeed) = generateColumnNumbers(randomSeed);
//         (bottom, randomSeed) = generateColumnNumbers(randomSeed);
//         uint[9] memory columnCount;
//         bool[9][3] memory hasNumber;
//         for(uint i = 0; i < 5; i++) {
//             columnCount[top[i]]++;
//             columnCount[middle[i]]++;
//             columnCount[bottom[i]]++;
//             hasNumber[0][top[i]] = true;
//             hasNumber[1][middle[i]] = true;
//             hasNumber[2][bottom[i]] = true;
//         }
//         for(uint i = 0; i < 9; i++) {
//             assert(columnCount[i] <= 3);
//         }
//         uint8[3] memory column;
//         for(uint8 i = 0; i < 9; i++) {
//             (column, randomSeed) = generateColumn(randomSeed, i, columnCount[i]);
//             column = sortColumn(column, columnCount[i]);
//             uint usedIndex = 0;
//             uint row = 0;
//             while(usedIndex < columnCount[i] && row < 3) {
//                 if (hasNumber[row][i] == true) {
//                     ticket.numbers[row].push(column[usedIndex]);
//                     usedIndex++;
//                 }
//                 row++;
//             }
//         }
//         ticket.active = true;
//     }

//     function generateColumnNumbers(uint256 rand) internal view returns (uint[5] memory, uint256 randomSeed) {
//         uint8[9] memory options = [0, 1, 2, 3, 4, 5, 6, 7, 8];
//         uint[5] memory row;
//         for(uint i = 0; i < 5; i++) {
//             rand = random(rand);
//             uint256 index = rand % (options.length - i);
//             row[i] = options[index];
//             options[index] = options[options.length - 1 - i];
//         }
//         return (row, rand);
//     }
    
//     function sortColumn(uint8[3] memory column, uint limit) internal pure returns (uint8[3] memory){
//         if (limit == 3) {
//             uint8[3] memory newColumn;
//             if (column[0] > column[1]) {
//                  if (column[0] > column[2]) {
//                      if(column[1] > column[2]) {
//                          // 0 > 1 > 2
//                          newColumn[0] = column[2];
//                          newColumn[1] = column[1];
//                          newColumn[2] = column[0];
//                      }
//                      else {
//                          // 0 > 2 > 1
//                          newColumn[0] = column[1];
//                          newColumn[1] = column[2];
//                          newColumn[2] = column[0];
//                      }
//                  }
//                  else {
//                      // 2 > 0 > 1
//                      newColumn[0] = column[1];
//                      newColumn[1] = column[0];
//                      newColumn[2] = column[2];
//                  }
//             }
//             else {
//                  if (column[0] > column[2]) {
//                      // 1 > 0 > 2
//                      newColumn[0] = column[2];
//                      newColumn[1] = column[0];
//                      newColumn[2] = column[1];
//                  }
//                  else {
//                      if(column[1] > column[2]) {
//                          // 1 > 2 > 0
//                          newColumn[0] = column[0];
//                          newColumn[1] = column[2];
//                          newColumn[2] = column[1];
//                      }
//                      else {
//                          // 2 > 1 > 0
//                          newColumn[0] = column[0];
//                          newColumn[1] = column[1];
//                          newColumn[2] = column[2];
//                      }
//                  }
//             }
//             return newColumn;
//         }
//         if (limit == 2 && column[0] > column[1]) {
//             uint8 temp = column[1];
//             column[1] = column[0];
//             column[0] = temp;
//         }
//         return column;
//     }

//     function generateColumn(uint256 rand, uint8 columnNumber, uint limit) internal view returns (uint8[3] memory, uint256 randomSeed) {
//         uint8[3] memory column;
//         if (columnNumber == 0) {
//             uint8[9] memory options = [1, 2, 3, 4, 5, 6, 7, 8, 9];
//             for(uint i = 0; i < limit; i++) {
//                 rand = random(rand);
//                 uint256 index = rand % (options.length - i);
//                 column[i] = columnNumber * 10 + options[index];
//                 options[index] = options[options.length - 1 - i];
//             }
//         }
//         else if (columnNumber == 8) {
//             uint8[11] memory options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
//             for(uint i = 0; i < limit; i++) {
//                 rand = random(rand);
//                 uint256 index = rand % (options.length - i);
//                 column[i] = columnNumber * 10 + options[index];
//                 options[index] = options[options.length - 1 - i];
//             }
//         }
//         else {
//             uint8[10] memory options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
//             for(uint i = 0; i < limit; i++) {
//                 rand = random(rand);
//                 uint256 index = rand % (options.length - i);
//                 column[i] = columnNumber * 10 + options[index];
//                 options[index] = options[options.length - 1 - i];
//             }
//         }
//         return (column, rand);
//     }

    
//     function claimPrize(address host, PrizeType prizeType) public {
//         Game storage game = games[host];
//         GameStatus status = getGameStatus(game);
//         require(status == GameStatus.RUNNING, "No prizes to claim");
        
//         address player = msg.sender;
//         Ticket storage ticket = game.tickets[player];
//         require(ticket.active == true, "No ticket purchased");
//         require(game.claimedPrizes[uint8(prizeType)] == address(0), "Prize already claimed");

//         if (prizeType == PrizeType.FULL_HOUSE_1 || prizeType == PrizeType.FULL_HOUSE_2 || prizeType == PrizeType.FULL_HOUSE_3) {
//             require(game.claimedPrizes[uint8(PrizeType.FULL_HOUSE_1)] != player, "You can only claim one full house");
//             require(game.claimedPrizes[uint8(PrizeType.FULL_HOUSE_2)] != player, "You can only claim one full house");
//             require(game.claimedPrizes[uint8(PrizeType.FULL_HOUSE_3)] != player, "You can only claim one full house");
//         }
//         uint256 remainingNumbers = game.remainingNumbers;
//         uint256 mask = maskTicketForPrizeType(prizeType, games[host].tickets[player]);
//         bool won = false;
//         if (prizeType == PrizeType.FASTEST_FIVE) {
//             uint256 result = mask & ~remainingNumbers;
//             for(uint256 i = 0; i < 4; i++) {
//                 result = unSetRightMostBit(result);
//             }
//             won = result > 0;
//         }
//         else {
//             won = mask & remainingNumbers == 0;
//         }
//         if (won == false) {
//             if (game.bogusPenalty == true) {
//                 ticket.active = false;
//             }
//         } else {
//             game.claimedPrizes[uint8(prizeType)] = player;
//             game.remainingPrizesCount--;
//         }

//     }
    
//     function maskTicketForPrizeType(PrizeType prizeType, Ticket memory ticket) private pure returns(uint bitmask) {
//         if (prizeType == PrizeType.TOP_ROW) {
//             return convertNumbersToBitmask(ticket.numbers[0]);
//         }
//         if (prizeType == PrizeType.MIDDLE_ROW) {
//             return convertNumbersToBitmask(ticket.numbers[1]);
//         }
//         if (prizeType == PrizeType.BOTTOM_ROW) {
//             return convertNumbersToBitmask(ticket.numbers[2]);
//         }
//         if (prizeType == PrizeType.CENTER) {
//             uint8[] memory expected = new uint8[](1);
//             expected[0] =  ticket.numbers[0][2];
//             return convertNumbersToBitmask(expected);
//         }
//         if (prizeType == PrizeType.CORNERS) {
//             uint8[] memory expected = new uint8[](4);
//             expected[0] =  ticket.numbers[0][0];
//             expected[1] =  ticket.numbers[0][4];
//             expected[2] =  ticket.numbers[2][0];
//             expected[3] =  ticket.numbers[2][4];
//             return convertNumbersToBitmask(expected);
//         }
//         uint allMask = convertNumbersToBitmask(ticket.numbers[0]) | convertNumbersToBitmask(ticket.numbers[1]) | convertNumbersToBitmask(ticket.numbers[2]);
//         if (prizeType == PrizeType.FULL_HOUSE_1 || prizeType == PrizeType.FULL_HOUSE_2 || prizeType == PrizeType.FULL_HOUSE_3) {
//             return allMask;
//         }
//         if (prizeType == PrizeType.BREAKFAST) {
//             uint mask = (1 << 29) - 1; // 1 - 29
//             return allMask & ~mask;
//         }
//         if (prizeType == PrizeType.LUNCH) {
//             uint256 mask = ((1 << 59) - 1) ^ ((1 << 29) - 1); // 30 - 59
//             return allMask & ~mask;
//         }
//         if (prizeType == PrizeType.DINNER) {
//             uint256 mask = ((1 << 90) - 1) ^ ((1 << 59) - 1); // 60 - 90
//             return allMask & ~mask;
//         }
//         if (prizeType == PrizeType.FASTEST_FIVE) {
//             return allMask;
//         }
//         return (1 << 90) - 1;
//     }
    
//     function convertNumbersToBitmask(uint8[] memory numbers) internal pure returns (uint) {
//         uint bitmask;
//         for(uint8 i = 0; i < numbers.length; i++) {
//             bitmask |= 1 << (numbers[i] - 1);
//         }
//         return bitmask;
//     }
    
//     function unSetRightMostBit(uint256 num) internal pure returns (uint256) {
//         return num & (num - 1);
//     }
    
//     // function onlyRightMostBit(uint256 num) internal pure returns (uint256) {
//     //     return num ^ (num & (num - 1));
//     // }
    
//     // function onlyLeftMostBit(uint256 num) internal pure returns (uint256) {
//     //     num |= num>>1;
//     //     num |= num>>2;
//     //     num |= num>>4;
//     //     num |= num>>8;
//     //     num |= num>>16;
//     //     num += 1;
//     //     return num >> 1;
//     // }
    
//     function random(uint seed) internal view returns (uint256) {
//         return uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp, seed)));
//     }
    
//     function getGeneratedNumbers(address host) public view returns (string memory) {
//         Game storage game = games[host];
//         GameStatus status = getGameStatus(game);
//         require(status != GameStatus.INVALID, "No game running");
//         return convertBitmaskToNumbers(game.remainingNumbers, false);
//     }
    
//     function convertBitmaskToNumbers(uint256 bitmask, bool on) internal pure returns (string memory) {
//         string memory generatedStr;
//         for(uint8 i = 1; i <= 90; i++) {
//             bool isOn = bitmask & (1 << (i - 1)) > 0;
//             if (isOn == on) {
//                 string memory num = uint2str(i);
//                 generatedStr = string(abi.encodePacked(generatedStr, ",", num));
//             }
//         }
//         return generatedStr;
//     }
    
//     function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
//         if (_i == 0) {
//             return "0";
//         }
//         uint j = _i;
//         uint len;
//         while (j != 0) {
//             len++;
//             j /= 10;
//         }
//         bytes memory bstr = new bytes(len);
//         uint k = len;
//         while (_i != 0) {
//             k = k-1;
//             uint8 temp = (48 + uint8(_i - _i / 10 * 10));
//             bytes1 b1 = bytes1(temp);
//             bstr[k] = b1;
//             _i /= 10;
//         }
//         return string(bstr);
//     }
// }
