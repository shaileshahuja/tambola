import {ChangeEvent, useState} from "react";
import {
    Box,
    Button,
    Divider,
    Flex,
    HStack,
    Icon,
    Input,
    InputGroup,
    InputRightElement,
    Select,
    StackDivider,
    Table,
    TableCaption,
    Tbody,
    Td,
    Text,
    Tr,
    VStack,
} from "@chakra-ui/react";
import {useContractMethod, useGame, usePrizesStatus, useTicket} from "../hooks";
import {BigNumber} from "ethers";
import {formatEther} from "@ethersproject/units";
import {GameDetails, PrizeType} from "./Game";
import {CloseIcon} from "@chakra-ui/icons";


export default function Play() {
    const [input, setInput] = useState("")
    const [host, setHost] = useState("")
    const game = useGame(host)

    function handleHostChange() {
        setHost(input);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        setInput(event.target.value);
    }

    return (
        <VStack
            divider={<StackDivider borderColor="gray.200"/>}
            spacing={4}
            align="stretch"
        >
            <Box h="50px">
                <InputGroup size="lg">
                    <Input placeholder="Host Address"
                           value={input} onChange={handleInputChange}/>
                    <InputRightElement width="8rem" mr={2}>
                        <Button size="md" onClick={handleHostChange} loadingText="Fetching" w={"100%"}>
                            Set Host
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </Box>
            <Main game={game} host={host}/>
        </VStack>
    )
}

function Main(props: { game: any, host: string }) {
    const {game, host} = props;
    if (host == undefined || game == undefined || game.ticketCost == undefined || game.ticketCost.eq(0)) {
        return (
            <Flex direction="column" align="center" mt="4">
                <Text>
                    No game found!
                </Text>
            </Flex>
        )
    }
    return (
        <VStack>
            <Ticket game={game} host={host}/>
            <Divider/>
            <GameDetails game={game} host={host}/>
        </VStack>
    );
}

function Ticket(props: { game: any, host: string }) {
    const {game, host} = props;
    const ticket = useTicket(host)
    const [clickedNumbers, setClickedNumbers] = useState([0])
    if (ticket === undefined || !ticket.active) {
        return <BuyTicket game={game} host={host}/>
    }

    const top = ticket.rows[0];
    const middle = ticket.rows[1];
    const bottom = ticket.rows[2];

    const borderTable = {
        border: '1px solid black',
    }
    const width = {
        'width': '75px',
        'height': '50px',
        'text-align': 'center'
    }

    const numberStyle = {
        'top': "50%",
        'left': "50%",
        'transform': "translate(-50%, -50%)",
        'font-size': '20px',
    }

    const iconStyle = {
        'top': "50%",
        'left': "50%",
        'transform': "translate(-50%, -50%)",
        'opacity': 0.5
    }

    function clickNumber(num: number) {
        if (num == undefined) {
            return
        }
        if (clickedNumbers.includes(num)) {
            setClickedNumbers(clickedNumbers.filter((n: number) => n !== num))
        } else {
            setClickedNumbers([...clickedNumbers, num])
        }
    }

    function getReadableRow(rowMask: BigNumber) {
        let numbers = Array<number>(9);
        for (let i = 1; i <= 90; i++) {
            let checkMask = BigNumber.from(1).shl(i - 1);
            if ((rowMask.and(checkMask)).gt(0)) {
                if (i === 90) {
                    numbers[8] = i;
                } else {
                    numbers[~~(i / 10)] = i;
                }
            }
        }
        var rows = [];
        for (let i = 0; i <= 8; i++) {
            let style = {...borderTable, ...width}
            let icon;
            if (clickedNumbers.includes(numbers[i])) {
                icon = <Icon as={CloseIcon} position="absolute" style={iconStyle} w={10} h={10}/>
            }
            rows.push(
                (
                    <Td position="relative" style={style} key={i} onClick={() => clickNumber(numbers[i])}>
                        {icon}
                        <Text position="absolute" style={numberStyle}>
                            {numbers[i]}
                        </Text>
                    </Td>
                )
            )
        }
        return (<Tr style={borderTable}>{rows}</Tr>);
    }

    return (
        <Flex direction="column" align="center">
            <Box direction="column" align="center">
                <Table variant="striped">
                    <TableCaption placement="top">Ticket</TableCaption>
                    <Tbody>
                        {getReadableRow(top)}
                        {getReadableRow(middle)}
                        {getReadableRow(bottom)}
                    </Tbody>
                </Table>
            </Box>
            <ClaimPrize game={game} host={host}/>
        </Flex>
    );
}

function BuyTicket(props: { game: any, host: string }) {
    const {game, host} = props;
    const {state: buyTicketState, send: buyTicket} = useContractMethod("buyTicket(address)");
    const ticketCost = game.ticketCost

    function handleBuyTicket() {
        buyTicket(host, {'value': ticketCost, 'gasLimit': 500000});
    }

    return (
        <Flex>
            <Button colorScheme="teal" size="lg" onClick={handleBuyTicket}>
                Buy Ticket for {ticketCost && formatEther(ticketCost)}
            </Button>
        </Flex>
    );
}

function ClaimPrize(props: { game: any, host: string }) {
    const {game, host} = props;
    const winners = usePrizesStatus(host)
    const [prize, setPrize] = useState<undefined | number>(undefined)
    const {state: claimPrizeState, send: claimPrize} = useContractMethod("claimPrize");

    function handleClaimPrize() {
        if (prize !== undefined) {
            claimPrize(host, prize);
        }
    }

    function handlePrizeChange(event: ChangeEvent<HTMLSelectElement>) {
        setPrize(parseInt(event.target.value))
    }

    let options = []
    if (winners !== undefined) {
        for (let i = 0; i <= 11; i++) {
            let winner = BigNumber.from(winners[i])
            if (winner.eq(0)) {
                let prize = PrizeType[i]
                options.push(
                    (
                        <option value={i}>{prize}</option>
                    )
                )
            }
        }
    }
    return (
        <HStack spacing="24px" m={5}>
            <Text>
                {claimPrizeState.errorMessage}
            </Text>
            <Select placeholder="Select prize" onChange={handlePrizeChange}>
                {options}
            </Select>
            <Button width="200px" colorScheme="blue" onClick={handleClaimPrize} disabled={prize === undefined}>
                Claim Prize
            </Button>
        </HStack>
    )
}
