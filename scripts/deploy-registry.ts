import { ethers, network, upgrades } from 'hardhat'
import {
  printChainInfo,
  printDeploymentTransaction,
  printSignerInfo,
  verifyContract,
  waitOneMinute,
} from './helpers'

async function main() {
  // Print info
  await printChainInfo()
  await printSignerInfo()
  // Deploy contract
  const contractName = 'LunchbreakRegistry'
  const proxyAddress =
    network.name === 'testnet'
      ? '0x2afd25e8aDFe037b79c25D1518ac9A6b8136Fd3e'
      : '0x0dfdbe6284ed9b97aecaef1c8cffe00b46d94e71'
  console.log(`Deploying ${contractName}...`)
  const Contract = await ethers.getContractFactory(contractName)
  const contract = await upgrades.deployProxy(Contract, [proxyAddress], {
    kind: 'transparent',
  })
  printDeploymentTransaction(contract)
  await contract.waitForDeployment()
  // Verify contract
  await waitOneMinute()
  await verifyContract(contract)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
