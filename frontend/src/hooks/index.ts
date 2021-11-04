import {ethers} from "ethers";
import {Contract} from "@ethersproject/contracts";
import {useContractCall, useContractFunction, useEthers} from "@usedapp/core";
import tambolaContractAbi from "../abi/Tambola.json";
import { useTambolaContractAddress} from "../contracts";

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
    const {account} = useEthers()
    const [ticket]: any =
    useContractCall({
        abi: tambolaContractInterface,
        address: tambolaContractAddress,
        method: "getTicket",
        args: [host, account],
    }) ?? [];
    console.log('Ticket ' + ticket)
    console.log('Account ' + account)
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
    const contract = new Contract(tambolaContractAddress, tambolaContractInterface);
    const {state, send} = useContractFunction(contract, methodName);
    return {state, send};
}
