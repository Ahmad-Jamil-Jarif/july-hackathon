import axios from 'axios'

const PINATA_JWT = process.env.PINATA_JWT

if (!PINATA_JWT) {
  console.warn('PINATA_JWT environment variable is not set')
}

export const pinFileToIPFS = async (file: File): Promise<string> => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return res.data.IpfsHash
  } catch (error) {
    console.error('Error pinning file to IPFS:', error)
    throw new Error('Failed to pin file to IPFS')
  }
}

export const pinJSONToIPFS = async (body: any): Promise<string> => {
  try {
    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      body,
      {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return res.data.IpfsHash
  } catch (error) {
    console.error('Error pinning JSON to IPFS:', error)
    throw new Error('Failed to pin JSON to IPFS')
  }
}

export const getPinataGatewayUrl = (ipfsHash: string): string => {
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
}