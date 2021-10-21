import {ethers} from "ethers";
import {Contract} from "@ethersproject/contracts";
import {useContractCall, useContractFunction, useEthers} from "@usedapp/core";
import tambolaContractAbi from "../abi/Tambola.json";
import {tambolaContractAddress} from "../contracts";

const tambolaContractInterface = new ethers.utils.Interface(tambolaContractAbi);
const contract = new Contract(tambolaContractAddress, tambolaContractInterface);

export function useGame(host: string | null | undefined = null) {
  const { account } = useEthers();
  if (host == undefined) {
    host = account
  }
  const [game]: any =
    useContractCall({
      abi: tambolaContractInterface,
      address: tambolaContractAddress,
      method: "games",
      args: [host],
    }) ?? [];
  console.log("game" + game);
  return game;
}

export function useTicket(host: string) {
  const [ticket]: any =
    useContractCall({
      abi: tambolaContractInterface,
      address: tambolaContractAddress,
      method: "getTicket",
      args: [host],
    }) ?? [];
  console.log("ticket" + ticket);
  return ticket;
}

export function useContractMethod(methodName: string) {
  const { state, send } = useContractFunction(contract, methodName);
  return { state, send };
}
