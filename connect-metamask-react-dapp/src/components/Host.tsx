import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import {useContractMethod, useGame} from "../hooks";
import {BigNumber, utils} from "ethers";

export default function Host() {
  const game = useGame();
  const { state, send: hostGame } = useContractMethod("hostGame");
  const { state: generateNextState, send: generateNext } =
    useContractMethod("generateNext");
  const [input, setInput] = useState("");

  function handleHostGame() {
    const ticketCost = parseInt(input);
    hostGame(ticketCost, false);
  }

  function handleGenerateNext() {
    generateNext({'gasLimit': 100000});
  }

  function handleInput(valueAsString: string, valueAsNumber: number) {
    setInput(valueAsString);
  }
  const numbersBitmask = game?.remainingNumbers
  function getReadableNumbers() {
    if (numbersBitmask === undefined) {
      return "";
    }
    let readableNumbers: Array<number> = [];
    for(let i = 1; i <= 90; i++) {
      let checkMask = BigNumber.from(1).shl(i - 1);
      if ((numbersBitmask.and(checkMask)) === 0) {
        readableNumbers.push(i);
      }
    }
    return readableNumbers.join(", ");
  }

  return (
    <Flex direction="column" align="center" mt="4">
      <Text color="white" fontSize="12">
        {generateNextState.errorMessage}
      </Text>
      <Text color="white" fontSize="12">
        {getReadableNumbers()}
      </Text>
        <Button isFullWidth colorScheme="purple" onClick={handleGenerateNext}>
          Generate Next
        </Button>
      <Box mt={4}>
        <NumberInput
          mb={2}
          min={1}
          value={input}
          onChange={handleInput}
          color="white"
          clampValueOnBlur={false}
        >
          <NumberInputField />
        </NumberInput>
        <Button colorScheme="teal" size="lg" onClick={handleHostGame}>
          Host Game
        </Button>
      </Box>
    </Flex>
  );
}
