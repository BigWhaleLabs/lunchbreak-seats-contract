import { ethers, upgrades } from 'hardhat'
import prompt from 'prompt'

const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/

async function main() {
  const factory = await ethers.getContractFactory('LunchbreakSeats')
  const { proxyAddress } = await prompt.get({
    properties: {
      proxyAddress: {
        required: true,
        message: 'Proxy address',
        pattern: ethAddressRegex,
        default: '0xeE4c478E11829C33709664361Ba5240d33dCa057', // Testnet
      },
    },
  })
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
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
