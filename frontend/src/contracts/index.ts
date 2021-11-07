import { ChainId, useEthers } from "@usedapp/core";

export function useTambolaContractAddress(): string {
	const { chainId } = useEthers();
	const defaultAddress = '0x9D64cA46B1A70455039D6e256Acfd3d3D542Bba5';
	if (chainId == undefined) {
		return defaultAddress;
	}
	const contracts = {
		[ChainId.Mumbai]: '0x0a0A65F51c9b752330c6b2550fb6a12d39890eF5',
		[ChainId.Localhost]: '0x9D64cA46B1A70455039D6e256Acfd3d3D542Bba5',
		[ChainId.Polygon]: '0xAcC4586c8DeBB07237F850896084cd1c65731814',
		[ChainId.Mainnet]: '',
		[ChainId.Ropsten]: '',
		[ChainId.Kovan]: '',
		[ChainId.Rinkeby]: '',
		[ChainId.Goerli]: '',
		[ChainId.BSC]: '',
		[ChainId.BSCTestnet]: '',
		[ChainId.Theta]: '',
		[ChainId.ThetaTestnet]: '',
		[ChainId.Palm]: '',
		[ChainId.Fantom]: '',
		[ChainId.xDai]: '',
		[ChainId.Moonriver]: '',
		[ChainId.Harmony]: '',
		[ChainId.Hardhat]: '',
	}
	return contracts[chainId];
}
