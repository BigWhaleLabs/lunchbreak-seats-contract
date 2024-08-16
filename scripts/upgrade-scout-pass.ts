import { ethers, run, upgrades } from 'hardhat'

async function main() {
  const factory = await ethers.getContractFactory('LunchbreakScoutPass')
  const proxyAddress = '0xA77F3AEc747a08Bf80682E002a26F88B59612c7F'
  console.log('Upgrading LunchbreakScoutPass...')
  const contract = await upgrades.upgradeProxy(proxyAddress as string, factory)
  console.log('LunchbreakScoutPass upgraded')
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
      'Error verifying contract on Etherscan:',
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
