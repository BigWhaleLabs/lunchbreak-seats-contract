import { ethers, network, run, upgrades } from 'hardhat'

async function main() {
  const factory = await ethers.getContractFactory('LunchbreakSeats')
  const proxyAddress =
    network.name === 'testnet'
      ? '0x2afd25e8aDFe037b79c25D1518ac9A6b8136Fd3e'
      : '0x0dfdbe6284ed9b97aecaef1c8cffe00b46d94e71'
  console.log('Upgrading LunchbreakSeats...')
  const contract = await upgrades.upgradeProxy(proxyAddress as string, factory)
  console.log('LunchbreakSeats upgraded')
  console.log(
    await upgrades.erc1967.getImplementationAddress(
      await contract.getAddress()
    ),
    ' getImplementationAddress'
  )
  console.log(
    await upgrades.erc1967.getAdminAddress(await contract.getAddress()),
    ' getAdminAddress'
  )
  console.log('Wait for 1 minute to make sure blockchain is updated')
  await new Promise((resolve) => setTimeout(resolve, 60 * 1000))
  // Try to verify the contract on Etherscan
  console.log('Verifying contract on Etherscan')
  try {
    await run('verify:verify', {
      address: await upgrades.erc1967.getImplementationAddress(
        await contract.getAddress()
      ),
      constructorArguments: [],
    })
  } catch (err) {
    console.log(
      'Error verifiying contract on Etherscan:',
      err instanceof Error ? err.message : err
    )
  }
  // Print out the information
  console.log(`Done!`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
