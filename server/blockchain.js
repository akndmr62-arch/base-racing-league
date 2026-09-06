import { ethers } from 'ethers'
import { config } from './config.js'

const provider = new ethers.JsonRpcProvider(config.BASE_RPC_URL)

const NFT_ABI = [
  'function ownerOf(uint256 tokenId) public view returns (address)',
  'function balanceOf(address owner) public view returns (uint256)',
]

const nftContract = new ethers.Contract(
  config.NFT_CONTRACT_ADDRESS,
  NFT_ABI,
  provider
)

export const verifyNFTOwnership = async (walletAddress, nftId) => {
  try {
    const owner = await nftContract.ownerOf(nftId)
    return owner.toLowerCase() === walletAddress.toLowerCase()
  } catch (error) {
    console.error('Error verifying NFT ownership:', error)
    return false
  }
}

export const getCurrentNFTOwner = async (nftId) => {
  try {
    const owner = await nftContract.ownerOf(nftId)
    return owner.toLowerCase()
  } catch (error) {
    console.error('Error fetching NFT owner:', error)
    return null
  }
}

export const getProvider = () => provider
export const getNFTContract = () => nftContract

export default provider
