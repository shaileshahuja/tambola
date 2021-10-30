import {Box, ChakraProvider, Grid, GridItem, useDisclosure, Text, Flex, useToast} from "@chakra-ui/react";
import theme from "./theme";
import Layout from "./components/Layout";
import ConnectButton from "./components/ConnectButton";
import AccountModal from "./components/AccountModal";
import Host from "./components/Host";
import "@fontsource/inter";
import {Tabs, TabList, TabPanels, Tab, TabPanel} from "@chakra-ui/react"
import Play from "./components/Play";
import {useEthers, useNotifications} from "@usedapp/core";
import {useEventToasts} from "./components/Game";
import {useEffect} from "react";

function App() {
    const {isOpen, onOpen, onClose} = useDisclosure();
    return (
        <ChakraProvider theme={theme}>
            <Box>
                <Grid
                    templateRows="repeat(20, 1fr)"
                    templateColumns="repeat(5, 1fr)"
                    gap={4}
                >
                    <GridItem rowSpan={1} colSpan={5} bg="grey">
                        <ConnectButton handleOpenModal={onOpen}/>
                        <AccountModal isOpen={isOpen} onClose={onClose}/>
                    </GridItem>
                    <GridItem rowSpan={19} colSpan={5}>
                        <Main/>
                    </GridItem>
                </Grid>
            </Box>
        </ChakraProvider>
    );
}

function Main() {
    const {account} = useEthers();
    Notifications()
    if (account == undefined) {
        return <Text>Connect your wallet to play</Text>
    }
    return (
        <Tabs>
            <TabList>
                <Tab>Host</Tab>
                <Tab>Play</Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <Host/>
                </TabPanel>
                <TabPanel>
                    <Play/>
                </TabPanel>
            </TabPanels>
        </Tabs>
    )
}

function Notifications() {
    const { notifications } = useNotifications()
    const toast = useToast()

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
        for(let notification of notifications) {
            console.log(notification)
            createToast(notification.id, notification.type, notification.type)
        }
    }, [notifications])

}

export default App;
