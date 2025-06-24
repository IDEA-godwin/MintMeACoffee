
import PinataSDK  from "@pinata/sdk"

export const pinata = new PinataSDK({
   pinataJWTKey: `${process.env.PINATA_JWT}`,
   pinataSecretApiKey:`${process.env.NEXT_PUBLIC_GATEWAY_URL}`,
});