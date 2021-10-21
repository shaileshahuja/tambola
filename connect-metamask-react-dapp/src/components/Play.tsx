import {ChangeEvent, ChangeEventHandler, useState} from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Input, InputRightElement, InputGroup,
} from "@chakra-ui/react";
import {useContractMethod, useGame, useTicket} from "../hooks";
import {BigNumber} from "ethers";
import {formatEther} from "@ethersproject/units";

export default function Play() {
  const [input, setInput] = useState("");
  const [host, setHost] = useState("");
  const game = useGame(host);

  function claimPrize() {
    // generateNext({'gasLimit': 100000});
  }

  function handleHostChange() {
    setHost(input);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    setInput(event.target.value);
  }
  let gameComponent = undefined;
  if (game != undefined) {
    gameComponent = (
      <Flex direction="column" align="center" mt="4">
        <Ticket game={game} host={host}/>
        <Button isFullWidth colorScheme="purple" onClick={claimPrize}>
          Claim Prize
        </Button>
      </Flex>
    );
  }
  return (
    <Flex direction="column" align="center" mt="4">
      <InputGroup size="md">
        <Input placeholder="Host Address"
        value={input} onChange={handleInputChange} />
        <InputRightElement width="8rem">
          <Button h="1.75rem" size="sm" onClick={handleHostChange}
          isLoading={host != "" && game == undefined}
          loadingText="Fetching">
            Get Game
          </Button>
        </InputRightElement>
      </InputGroup>
      {game && gameComponent}
    </Flex>
  );
}

function Ticket(props: {game: any, host: string}) {
  const {game, host} = props;
  const ticket = useTicket(host)
  if (ticket == undefined || !ticket.active) {
    return <BuyTicket  game={game} host={host}/>
  }

  const top = ticket.rows[0];
  const middle = ticket.rows[1];
  const bottom = ticket.rows[2];

  function getReadableRow(rowMask: BigNumber) {
    if(rowMask === undefined) {
      return "";
    }
    let numbers = Array<number>(9);
    for(let i = 1; i <= 90; i++) {
      let checkMask = BigNumber.from(1).shl(i - 1);
      if ((rowMask.and(checkMask)).gt(0)) {
        if (i === 90) {
          numbers[8] = i;
        }
        else {
          numbers[~~(i / 10)] = i;
        }
      }
    }
    return numbers.join(", ");
  }

  return (
    <Box direction="column" align="center" mt="4">
      <Text color="white" fontSize="12">
        {getReadableRow(top)}
      </Text>
      <Text color="white" fontSize="12">
        {getReadableRow(middle)}
      </Text>
      <Text color="white" fontSize="12">
        {getReadableRow(bottom)}
      </Text>
    </Box>
  );
}

function BuyTicket(props: {game: any, host: string}) {
  const {game, host} = props;
  const { state: buyTicketState, send: buyTicket } = useContractMethod("buyTicket");
  const ticketCost = game.ticketCost

  function handleBuyTicket() {
    buyTicket(host, {'value': ticketCost, 'gasLimit': 400000});
  }
  return (
    <Flex>
      <Button colorScheme="teal" size="lg" onClick={handleBuyTicket}>
        Buy Ticket for {ticketCost && formatEther(ticketCost)}
      </Button>
    </Flex>
  );
}