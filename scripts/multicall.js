
// var jsn = {
//   "abi": [
//     {
//       "inputs": [
//         {
//           "components": [
//             {
//               "internalType": "address",
//               "name": "target",
//               "type": "address"
//             },
//             {
//               "internalType": "bytes",
//               "name": "callData",
//               "type": "bytes"
//             }
//           ],
//           "internalType": "struct Multicall.Call[]",
//           "name": "calls",
//           "type": "tuple[]"
//         }
//       ],
//       "name": "aggregate",
//       "outputs": [
//         {
//           "internalType": "uint256",
//           "name": "blockNumber",
//           "type": "uint256"
//         },
//         {
//           "internalType": "bytes[]",
//           "name": "returnData",
//           "type": "bytes[]"
//         }
//       ],
//       "stateMutability": "nonpayable",
//       "type": "function"
//     },
//     {
//       "inputs": [
//         {
//           "internalType": "uint256",
//           "name": "blockNumber",
//           "type": "uint256"
//         }
//       ],
//       "name": "getBlockHash",
//       "outputs": [
//         {
//           "internalType": "bytes32",
//           "name": "blockHash",
//           "type": "bytes32"
//         }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//     },
//     {
//       "inputs": [],
//       "name": "getCurrentBlockCoinbase",
//       "outputs": [
//         {
//           "internalType": "address",
//           "name": "coinbase",
//           "type": "address"
//         }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//     },
//     {
//       "inputs": [],
//       "name": "getCurrentBlockDifficulty",
//       "outputs": [
//         {
//           "internalType": "uint256",
//           "name": "difficulty",
//           "type": "uint256"
//         }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//     },
//     {
//       "inputs": [],
//       "name": "getCurrentBlockGasLimit",
//       "outputs": [
//         {
//           "internalType": "uint256",
//           "name": "gaslimit",
//           "type": "uint256"
//         }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//     },
//     {
//       "inputs": [],
//       "name": "getCurrentBlockTimestamp",
//       "outputs": [
//         {
//           "internalType": "uint256",
//           "name": "timestamp",
//           "type": "uint256"
//         }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//     },
//     {
//       "inputs": [
//         {
//           "internalType": "address",
//           "name": "addr",
//           "type": "address"
//         }
//       ],
//       "name": "getEthBalance",
//       "outputs": [
//         {
//           "internalType": "uint256",
//           "name": "balance",
//           "type": "uint256"
//         }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//     },
//     {
//       "inputs": [],
//       "name": "getLastBlockHash",
//       "outputs": [
//         {
//           "internalType": "bytes32",
//           "name": "blockHash",
//           "type": "bytes32"
//         }
//       ],
//       "stateMutability": "view",
//       "type": "function"
//     }
//   ],
//   "bytecode": "608060405234801561001057600080fd5b5061066e806100206000396000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c806372425d9d1161005b57806372425d9d146100e757806386d516e8146100ef578063a8b0574e146100f7578063ee82ac5e1461010c57610088565b80630f28c97d1461008d578063252dba42146100ab57806327e86d6e146100cc5780634d2301cc146100d4575b600080fd5b61009561011f565b6040516100a2919061051e565b60405180910390f35b6100be6100b93660046103b6565b610123565b6040516100a292919061052c565b610095610231565b6100956100e2366004610390565b61023a565b610095610247565b61009561024b565b6100ff61024f565b6040516100a2919061050a565b61009561011a3660046103eb565b610253565b4290565b60006060439150825160405190808252806020026020018201604052801561015f57816020015b606081526020019060019003908161014a5790505b50905060005b835181101561022b576000606085838151811061017e57fe5b6020026020010151600001516001600160a01b031686848151811061019f57fe5b6020026020010151602001516040516101b891906104fe565b6000604051808303816000865af19150503d80600081146101f5576040519150601f19603f3d011682016040523d82523d6000602084013e6101fa565b606091505b50915091508161020957600080fd5b8084848151811061021657fe5b60209081029190910101525050600101610165565b50915091565b60001943014090565b6001600160a01b03163190565b4490565b4590565b4190565b4090565b600061026382356105d4565b9392505050565b600082601f83011261027b57600080fd5b813561028e61028982610573565b61054c565b81815260209384019390925082018360005b838110156102cc57813586016102b68882610325565b84525060209283019291909101906001016102a0565b5050505092915050565b600082601f8301126102e757600080fd5b81356102f561028982610594565b9150808252602083016020830185838301111561031157600080fd5b61031c8382846105ee565b50505092915050565b60006040828403121561033757600080fd5b610341604061054c565b9050600061034f8484610257565b825250602082013567ffffffffffffffff81111561036c57600080fd5b610378848285016102d6565b60208301525092915050565b600061026382356105df565b6000602082840312156103a257600080fd5b60006103ae8484610257565b949350505050565b6000602082840312156103c857600080fd5b813567ffffffffffffffff8111156103df57600080fd5b6103ae8482850161026a565b6000602082840312156103fd57600080fd5b60006103ae8484610384565b60006102638383610497565b61041e816105d4565b82525050565b600061042f826105c2565b61043981856105c6565b93508360208202850161044b856105bc565b60005b84811015610482578383038852610466838351610409565b9250610471826105bc565b60209890980197915060010161044e565b50909695505050505050565b61041e816105df565b60006104a2826105c2565b6104ac81856105c6565b93506104bc8185602086016105fa565b6104c58161062a565b9093019392505050565b60006104da826105c2565b6104e481856105cf565b93506104f48185602086016105fa565b9290920192915050565b600061026382846104cf565b602081016105188284610415565b92915050565b60208101610518828461048e565b6040810161053a828561048e565b81810360208301526103ae8184610424565b60405181810167ffffffffffffffff8111828210171561056b57600080fd5b604052919050565b600067ffffffffffffffff82111561058a57600080fd5b5060209081020190565b600067ffffffffffffffff8211156105ab57600080fd5b506020601f91909101601f19160190565b60200190565b5190565b90815260200190565b919050565b6000610518826105e2565b90565b6001600160a01b031690565b82818337506000910152565b60005b838110156106155781810151838201526020016105fd565b83811115610624576000848401525b50505050565b601f01601f19169056fea265627a7a72305820978cd44d5ce226bebdf172bdf24918753b9e111e3803cb6249d3ca2860b7a47f6c6578706572696d656e74616cf50037"
// }

//
// multicall.getEthBalance();

module.exports = function(callback) {
  let abi = [
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "target",
              "type": "address"
            },
            {
              "internalType": "bytes",
              "name": "callData",
              "type": "bytes"
            }
          ],
          "internalType": "struct Multicall.Call[]",
          "name": "calls",
          "type": "tuple[]"
        }
      ],
      "name": "aggregate",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "blockNumber",
          "type": "uint256"
        },
        {
          "internalType": "bytes[]",
          "name": "returnData",
          "type": "bytes[]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "blockNumber",
          "type": "uint256"
        }
      ],
      "name": "getBlockHash",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "blockHash",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCurrentBlockCoinbase",
      "outputs": [
        {
          "internalType": "address",
          "name": "coinbase",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCurrentBlockDifficulty",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "difficulty",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCurrentBlockGasLimit",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "gaslimit",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCurrentBlockTimestamp",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "addr",
          "type": "address"
        }
      ],
      "name": "getEthBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getLastBlockHash",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "blockHash",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
  var multicall = new web3.eth.Contract(abi, '0x0649Dab370a22803ab3b345a10D4624F92Bb0dB6');
  multicall.methods.getEthBalance('0xb7afB8386F68906868B47A03AfE3bfcD3168250D').call().then((value) => {
    console.log(value);
  });
  web3.eth.getBalance('0xb7afB8386F68906868B47A03AfE3bfcD3168250D').then((value) => {
    console.log(value);
  });
  // console.log(multicall);
}