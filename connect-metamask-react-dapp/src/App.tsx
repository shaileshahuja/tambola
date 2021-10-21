import {Box, ChakraProvider, Grid, GridItem, useDisclosure} from "@chakra-ui/react";
import theme from "./theme";
import Layout from "./components/Layout";
import ConnectButton from "./components/ConnectButton";
import AccountModal from "./components/AccountModal";
import Host from "./components/Host";
import "@fontsource/inter";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react"
import Play from "./components/Play";

function App() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <ChakraProvider theme={theme}>
      <Box>
      <Grid
        templateRows="repeat(20, 1fr)"
        templateColumns="repeat(5, 1fr)"
        gap={4}
      >
        <GridItem rowSpan={1} colSpan={5} bg="grey">
          <ConnectButton handleOpenModal={onOpen} />
          <AccountModal isOpen={isOpen} onClose={onClose} />
        </GridItem>
        <GridItem rowSpan={19} colSpan={4}>
          <Tabs>
            <TabList>
              <Tab>Host</Tab>
              <Tab>Play</Tab>
            </TabList>
            <TabPanels>
            <TabPanel>
              <Host />
            </TabPanel>
            <TabPanel>
              <Play />
            </TabPanel>
          </TabPanels>
          </Tabs>
        </GridItem>
        <GridItem rowSpan={19} colSpan={1}>
        </GridItem>
      </Grid>
        </Box>
    </ChakraProvider>
  );
}

export default App;
