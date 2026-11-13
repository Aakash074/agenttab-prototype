import { Contract, MockNetworkProvider, SignatureTemplate, TransactionBuilder, randomUtxo } from 'cashscript';
import { secp256k1, sha256, hash160, encodeCashAddress, generatePrivateKey, bigIntToVmNumber, padMinimallyEncodedVmNumber } from '@bitauth/libauth';
import artifact from '../contracts/AgentChannel.json' with { type: 'json' };
import assert from 'node:assert';

const key = () => { const pk = generatePrivateKey(); return { pk, pub: secp256k1.derivePublicKeyCompressed(pk) }; };
const owner = key(), provider = key();
const addr = (pub) => encodeCashAddress({ prefix: 'bchtest', type: 'p2pkh', payload: hash160(pub) }).address;
const provider_ = new MockNetworkProvider();
const timeout = 1_700_000_000n;
const c = new Contract(artifact, [owner.pub, provider.pub, timeout], { provider: provider_ });
const budget = 100_000n;
provider_.addUtxo(c.address, randomUtxo({ satoshis: budget }));
const [utxo] = await c.getUtxos();

const amt8 = (n) => padMinimallyEncodedVmNumber(bigIntToVmNumber(n), 8);
const voucher = (n, signer = owner, bytecode = c.bytecode) => {
  const msg = new Uint8Array([...sha256.hash(hexToBin(bytecode)), ...amt8(n)]);
  return secp256k1.signMessageHashSchnorr(signer.pk, sha256.hash(msg));
};
function hexToBin(h){return Uint8Array.from(h.match(/../g).map(x=>parseInt(x,16)));}

const settle = async (n, v, pay = n, back = budget - n - 800n) => new TransactionBuilder({ provider: provider_ })
  .addInput(utxo, c.unlock.settle(new SignatureTemplate(provider.pk), v, amt8(n)))
  .addOutput({ to: addr(provider.pub), amount: pay })
  .addOutput({ to: addr(owner.pub), amount: back })
  .send();

let ok = 0, fail = 0;
const expect = async (name, p, shouldPass) => {
  try { await p; assert(shouldPass, name + ' should have failed'); console.log('PASS', name); ok++; }
  catch (e) { if (!shouldPass) { console.log('PASS (rejected)', name); ok++; } else { console.log('FAIL', name, e.message.split('\n')[0]); fail++; } if(!shouldPass) console.log('   reason:', e.message.split('\n')[0].slice(0,110)); }
};
await expect('provider overclaims beyond voucher', settle(5000n, voucher(5000n), 6000n, budget - 6800n), false);
await expect('forged voucher (provider-signed)', settle(5000n, voucher(5000n, provider)), false);
await expect('voucher from another channel', settle(5000n, voucher(5000n, owner, c.bytecode.replace(/..$/, '00'))), false);
await expect('owner shortchanged', settle(5000n, voucher(5000n), 5000n, 50000n), false);
await expect('valid settle with signed voucher', settle(5000n, voucher(5000n)), true);
console.log(`${ok} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
