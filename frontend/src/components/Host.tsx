import {useEffect, useState} from "react";
import {
    Box,
    Button,
    Flex,
    Grid,
    GridItem, Input, InputGroup,
    InputRightAddon,
    NumberInput,
    NumberInputField,
    Spacer,
    Text, VStack,
} from "@chakra-ui/react";
import {useContractMethod, useGame} from "../hooks";
import {CurrencyValue, Ether, NativeCurrency, useEthers} from "@usedapp/core";
import {GameDetails, GameStatus, getGameStatus, useEventToasts} from "./Game";
import {BigNumber} from "ethers";
import {parseEther} from "ethers/lib/utils";

export default function Host() {
    const {account} = useEthers();
    const game = useGame(account);
    const gameStatus = getGameStatus(game)
    const {state: generateNextState, send: generateNext} = useContractMethod("generateNext()")
    if (gameStatus === GameStatus.INVALID) {
        return <HostGame/>
    }
    if (gameStatus === GameStatus.FINISHED) {
        return <EndGame/>
    }

    function handleGenerateNext() {
        generateNext({'gasLimit': 100000});
    }

    return (
        <VStack spacing={5}>
            <GameDetails game={game} host={account} />
            <Flex>
                <Button w={"750px"} colorScheme="purple" onClick={handleGenerateNext} size={"lg"}>
                    Generate Next
                </Button>
            </Flex>
        </VStack>
    );
}

function HostGame() {
    const {state, send: hostGame} = useContractMethod("hostGame");
    const [ticketCost, setTicketCost] = useState(BigNumber.from(0));
    const [invalid, setInvalid] = useState(false);

    function handleTicketCost(valueAsString: string) {
        try {
            let ether = parseEther(valueAsString)
            setTicketCost(ether)
            setInvalid(false)
        } catch (err) {
            console.log(err)
            setInvalid(true)
        }
    }

    function handleHostGame() {
        if (!invalid) {
            hostGame(ticketCost, false)
        }
    }

    return (
        <Flex direction="column" align="center" mt="4">
            <Box mt={4}>
                <InputGroup size="lg">
                    <Input
                        mb={2}
                        onChange={(event) => handleTicketCost(event.target.value)}
                        placeholder='Enter ticket cost'
                        isInvalid={invalid}
                    >
                    </Input>
                    <InputRightAddon children="ETH"/>
                </InputGroup>
                <Button colorScheme="teal" size="lg" onClick={handleHostGame} w={"100%"}>
                    Host Game
                </Button>
            </Box>
        </Flex>
    );
}

function EndGame() {
    const {state, send: endGame} = useContractMethod("endGame");

    function handleHostGame() {
        endGame();
    }

    return (
        <Button colorScheme="teal" size="lg" onClick={handleHostGame}>
            End Game
        </Button>
    )
}
