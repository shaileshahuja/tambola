import {
    Box,
    Center,
    Flex,
    HStack,
    ListIcon,
    SimpleGrid,
    Square,
    Stat,
    StatLabel,
    StatNumber,
    Text,
    useToast,
    VStack
} from "@chakra-ui/react";

import { formatEther } from "ethers/lib/utils";
import { usePrizesStatus } from "../hooks";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { BigNumber, ethers } from "ethers";
import { useTambolaContractAddress } from "../contracts";
import { useEthers } from "@usedapp/core";
import { useEffect, useState } from "react";
import tambolaContractAbi from "../abi/Tambola.json";
import GeneratedNumbers from "./GeneratedNumbers";

const tambolaContractInterface = new ethers.utils.Interface(tambolaContractAbi);

export enum GameStatus {
    INVALID = 0,
    WAITING_FOR_HOST,
    RUNNING,
    FINISHED,
}

export enum PrizeType {
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

export function getGameStatus(game: any) {
    if (game == undefined || game.ticketCost == 0) {
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
    let dateTime = new Date()
    let finishedAt = new Date(game.finishedAt.toNumber() * 1000)
    finishedAt.setDate(finishedAt.getDate())
    if (dateTime > finishedAt) {
        return GameStatus.FINISHED;
    }
    return GameStatus.RUNNING;
}

function GameStats(props: { game: any, host: any }) {
    const game = props.game;
    const host = props.host
    return (
        <HStack pt={5}>
            <Stat pl={10}>
                <StatLabel>Players</StatLabel>
                <StatNumber>{game.pot / game.ticketCost}</StatNumber>
            </Stat>
            <Stat pl={10}>
                <StatLabel>Total Pot (MATIC)</StatLabel>
                <StatNumber>{formatEther(game.pot)}</StatNumber>
            </Stat>
            <Stat pl={10}>
                <StatLabel>Prizes Left</StatLabel>
                <StatNumber>{game.remainingPrizesCount}</StatNumber>
            </Stat>
            <Flex pl={10}>
                <NewNumberBox host={host} />
            </Flex>
        </HStack>
    )
}

function PrizeStats(props: { host: string }) {
    const host = props.host;
    const winners = usePrizesStatus(host)
    if (winners == undefined) {
        return (
            <Text>Loading...</Text>
        )
    }
    let winnerList = []
    for (let i = 0; i <= 11; i++) {
        let winner = BigNumber.from(winners[i])
        if (winner.eq(0)) {
            winnerList.push(
                (
                    <Flex>
                        <ListIcon />
                        <Text>
                            {PrizeType[i]}
                        </Text>
                    </Flex>
                )
            )
        } else {
            winnerList.push(
                (
                    <Box md={4}>
                        <ListIcon as={CheckCircleIcon} color="green.500" />
                        <Text>
                            {PrizeType[i]}
                        </Text>
                    </Box>
                )
            )
        }
    }
    return (
        <SimpleGrid columns={2} spacing={10}>
            {winnerList}
        </SimpleGrid>
    )
}

export function GameDetails(props: { game: any, host: any }) {
    const { game, host } = props;
    useEventToasts(host)
    return (
        <VStack>
            <GameStats game={game} host={host} />
            <GeneratedNumbers numbersBitmask={game.remainingNumbers} />
        </VStack>
    )
}

function NewNumberBox(props: { host: string }) {
    const host = props.host
    const { library } = useEthers()
    const [newNumber, setNewNumber] = useState<number | undefined>(undefined)
    const tambolaContractAddress = useTambolaContractAddress();

    const contract = new ethers.Contract(tambolaContractAddress, tambolaContractInterface, library)
    useEffect(() => {
        if (host == undefined || host == "") {
            return
        }
        let event = contract.filters.NumberGenerated(host)
        function listener(host: string, num: BigNumber) {
            setNewNumber(num.toNumber())
        }
        contract.on(event, listener)
        return function unsubscribe() {
            contract.off(event, listener)
        }
    },
        [host]
    )
    if (host == undefined || host == "") {
        return (
            <Text>
                Loading...
            </Text>
        )
    }
    return (
        <Square>
            <VStack bg={'gray.400'}>
                <Text mt={'0.5rem'}>
                    NEW NUMBER
                </Text>
                <Center w={'150px'} h={'100px'} bg={'gray.200'}>
                    <Text fontSize={'75px'}>
                        {newNumber}
                    </Text>
                </Center>
            </VStack>
        </Square>
    )
}

export function useEventToasts(host: any) {
    const toast = useToast()
    const { library } = useEthers()
    const tambolaContractAddress = useTambolaContractAddress()
    const contract = new ethers.Contract(tambolaContractAddress, tambolaContractInterface, library)

    function createToast(id: string, title: string, description: string) {
        if (!toast.isActive(id)) {
            toast({
                id: id,
                title: title,
                description: description,
                status: 'info',
                variant: 'subtle',
                position: 'top-right',
                duration: 10000,
                isClosable: true,
            })
        }
    }

    useEffect(() => {
        if (host == undefined || host == "") {
            return
        }
        let event1 = contract.filters.NumberGenerated(host)
        let event2 = contract.filters.TicketBought(host)
        let event3 = contract.filters.PrizeClaimed(host)
        function listener1(host: string, num: BigNumber) {
            createToast(num.toString(), 'Number Generated', num.toString())
        }
        function listener2(host: string) {
            createToast(host.toString(), 'Ticket Bought', '')
        }
        function listener3(host: string, prizeType: number) {
            createToast(PrizeType[prizeType], 'Prize Claimed', PrizeType[prizeType])
        }
        contract.on(event1, listener1)
        contract.on(event2, listener2)
        contract.on(event3, listener3)
        return function unsubscribe() {
            contract.off(event1, listener1)
            contract.off(event2, listener2)
            contract.off(event3, listener3)
        }
    },
        [host]
    )
}