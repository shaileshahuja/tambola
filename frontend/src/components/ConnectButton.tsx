import {
    Box, Button, Text,
    useToast
} from "@chakra-ui/react";
import { useConfig, useEthers } from "@usedapp/core";
import Identicon from "./Identicon";

type Props = {
    handleOpenModal: any;
};

export default function ConnectButton({ handleOpenModal }: Props) {
    const { supportedChains } = useConfig()
    const { activateBrowserWallet, account } = useEthers();
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

    function onActivationError(error: Error) {
        console.log(error.message)
        createToast('WalletConnectionError', 'Wallet connection error', 'Please make sure you are on Polygon network and your wallet is connected')
    }
    function handleConnectWallet() {
        activateBrowserWallet(onActivationError);
    }
    let button;
    if (account) {
        button = (
            <Button
                onClick={handleOpenModal}
                bg="gray.800"
                border="1px solid transparent"
                _hover={{
                    border: "1px",
                    borderStyle: "solid",
                    borderColor: "blue.400",
                    backgroundColor: "gray.700",
                }}
                borderRadius="xl"
                m="1px"
                px={3}
            >
                <Text color="white" fontSize="md" fontWeight="medium" mr="2">
                    {account &&
                        `${account.slice(0, 6)}...${account.slice(
                            account.length - 4,
                            account.length
                        )}`}
                </Text>
                <Identicon />
            </Button>
        )
    } else {
        button = (
            <Button
                onClick={handleConnectWallet}
                bg="gray.800"
                color="blue.300"
                fontSize="md"
                fontWeight="medium"
                borderRadius="xl"
                border="1px solid transparent"
                _hover={{
                    borderColor: "blue.700",
                    color: "blue.400",
                }}
                _active={{
                    backgroundColor: "blue.800",
                    borderColor: "blue.700",
                }}
            >
                <Text color="white" fontSize="md" fontWeight="medium" mr="2"
                    _hover={{
                        borderColor: "blue.700",
                        color: "blue.400",
                    }}
                    _active={{
                        backgroundColor: "blue.800",
                        borderColor: "blue.700",
                    }}>
                    Connect your wallet
                </Text>
            </Button>
        )

    }
    return (
        <Box
            display="flex"
            alignItems="center"
            float={'right'}
        >
            {button}
        </Box>
    )
}
