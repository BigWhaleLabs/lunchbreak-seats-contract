import { Contract } from 'ethers'
import { ethers, run } from 'hardhat'

export async function printSignerInfo() {
  const [deployer] = await ethers.getSigners()
  const address = await deployer.getAddress()
  const balance = await ethers.provider.getBalance(deployer)
  console.log('Deploying contracts with the account:', address)
  console.log('Account balance:', ethers.formatEther(balance))
}

export function printDeploymentTransaction(contract: Contract) {
  const deploymentTransaction = contract.deploymentTransaction()
  if (!deploymentTransaction) {
    throw new Error('Deployment transaction is null')
  }
  console.log(
    'Deploy tx gas price:',
    ethers.formatEther(deploymentTransaction.gasPrice || 0)
  )
  console.log(
    'Deploy tx gas limit:',
    ethers.formatEther(deploymentTransaction.gasLimit)
  )
}

export async function verifyContract(contract: Contract) {
  const address = await contract.getAddress()
  console.log('Verifying contract on Etherscan')
  try {
    await run('verify:verify', {
      address,
      constructorArguments: [],
    })
  } catch (err) {
    console.log(
      'Error verifying contract on Etherscan:',
      err instanceof Error ? err.message : err
    )
  }
}

export async function waitOneMinute() {
  console.log('Wait for 1 minute to make sure blockchain is updated')
  await new Promise((resolve) => setTimeout(resolve, 60 * 1000))
}

export async function printChainInfo() {
  const provider = ethers.provider
  const { name: chainName } = await provider.getNetwork()
  console.log('Deploying to chain:', chainName)
}
