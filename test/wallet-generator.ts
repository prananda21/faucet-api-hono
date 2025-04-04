import { sha256 } from 'k6/crypto';

const generateUniqueWallet = (): string => {
  const privateKeyArrayBuffer = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    privateKeyArrayBuffer[i] = Math.floor(Math.random() * 256);
  }

  const privateKeyHex = Array.from(privateKeyArrayBuffer)
    .map((a) => a.toString(16).padStart(2, '0'))
    .join('');
  const privateKeyHash = sha256(privateKeyHex, 'hex');

  const wallet = `0x${privateKeyHash.slice(-40)}`;

  return wallet;
};

export default generateUniqueWallet;
