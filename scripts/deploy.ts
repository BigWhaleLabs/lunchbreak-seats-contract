import { ethers, upgrades } from 'hardhat'
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
  const contractName = 'LunchbreakSeats'
  console.log(`Deploying ${contractName}...`)
  const Contract = await ethers.getContractFactory(contractName)
  const contract = await upgrades.deployProxy(
    Contract,
    [
      '0xaBaf4EdFa5e492d5107fFf929198920e026C35a7',
      '0x274459384b38eaF2322BeDf889EEC30Ae7e0E158',
      ethers.parseEther('0.002'),
      ethers.parseEther('0.000001'),
      20,
      20,
    ],
    {
      kind: 'transparent',
    }
  )
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
