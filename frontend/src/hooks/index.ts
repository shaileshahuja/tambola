import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { useContractCall, useContractFunction, useEthers } from "@usedapp/core";
import tambolaContractAbi from "../abi/Tambola.json";
import { useTambolaContractAddress } from "../contracts";
import {
    useToast, AlertStatus
} from "@chakra-ui/react";
import { useEffect } from "react";

const tambolaContractInterface = new ethers.utils.Interface(tambolaContractAbi);

export function useGame(host: string | undefined | null) {
    const tambolaContractAddress = useTambolaContractAddress()
    const game: any =
        useContractCall({
            abi: tambolaContractInterface,
            address: tambolaContractAddress,
            method: "games",
            args: [host],
        }) ?? undefined;
    return game;
}

export function useTicket(host: string) {
    const tambolaContractAddress = useTambolaContractAddress()
    const { account } = useEthers()
    const [ticket]: any =
        useContractCall({
            abi: tambolaContractInterface,
            address: tambolaContractAddress,
            method: "getTicket",
            args: [host, account],
        }) ?? [];
    return ticket;
}

export function usePrizesStatus(host: string) {
    const tambolaContractAddress = useTambolaContractAddress()
    const [prizesStatus]: any =
        useContractCall({
            abi: tambolaContractInterface,
            address: tambolaContractAddress,
            method: "getPrizesStatus",
            args: [host],
        }) ?? [];
    return prizesStatus;
}

export function useContractMethod(methodName: string) {
    const tambolaContractAddress = useTambolaContractAddress()
    const toast = useToast()

    function createToast(id: string, title: string, description: string, statusType: AlertStatus) {
        if (!toast.isActive(id)) {
            toast({
                id: id,
                title: title,
                description: description,
                status: statusType,
                variant: 'subtle',
                position: 'top-right',
                duration: 10000,
                isClosable: true,
            })
        }
    }

    const contract = new Contract(tambolaContractAddress, tambolaContractInterface);
    const { state, send } = useContractFunction(contract, methodName);

    useEffect(() => {
        console.log(state)
        if (state.errorMessage != undefined) {
            createToast("Error", "Transaction Error", state.errorMessage, 'error')
        }
        if (state.status == "Mining") {
            createToast("Mining", "Transaction Started", "", 'info')
        }
    }, [state])

    return { state, send };
}

