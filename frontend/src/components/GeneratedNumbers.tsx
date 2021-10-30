import {BigNumber} from "ethers";
import {Box, Flex, Table, TableCaption, Tbody, Td, Tr} from "@chakra-ui/react";

export default function GeneratedNumbers(props: { numbersBitmask: BigNumber }) {
    const numbersBitmask = props.numbersBitmask

    const cellStyle = {
        border: '1px solid black',
        'width': '60px',
        'height': '60px',
        'text-align': 'center',
        'font-size': '20px',
    }
    const opaque = {
        opacity: 0.2
    }

    function getReadableNumbers() {
        let numbers = Array<boolean>(90);
        for (let i = 1; i <= 90; i++) {
            let checkMask = BigNumber.from(1).shl(i - 1);
            if ((numbersBitmask.and(checkMask)).eq(0)) {
                numbers[i - 1] = true;
            }
        }
        let curNum = 1;
        let rows = [];
        for (let i = 0; i <= 8; i++) {
            let row = [];
            for (let j = 1; j <= 10; j++) {
                if (numbers[curNum - 1]) {
                    row.push(<Td style={cellStyle} key={curNum} bg='gray.200'> {curNum} </Td>);
                } else {
                    row.push(<Td style={{...cellStyle, ...opaque}} key={curNum}> {curNum} </Td>);
                }
                curNum += 1
            }
            rows.push(<Tr style={cellStyle}>{row}</Tr>)
        }
        return (
            <Tbody>
                {rows}
            </Tbody>
        )
    }

    return (
        <Flex direction="column" align="center">
            <Box direction="column" align="center">
                <Table variant="striped">
                    <TableCaption placement="top">Board</TableCaption>
                    {getReadableNumbers()}
                </Table>
            </Box>
        </Flex>
    );
}
