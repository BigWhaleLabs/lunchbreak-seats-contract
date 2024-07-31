import { ethers, upgrades } from 'hardhat'
import { parseEther } from 'ethers'
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
  const contractName = 'LunchbreakScoutPass'
  console.log(`Deploying ${contractName}...`)
  const Contract = await ethers.getContractFactory(contractName)
  const [deployer] = await ethers.getSigners()
  const contract = await upgrades.deployProxy(
    Contract,
    [
      deployer.address,
      1n,
      parseEther('0.002'),
      'https://raw.githubusercontent.com/BigWhaleLabs/lunchbreak-metadata/main/metadata/{id}.json',
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
