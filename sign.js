// Private key — NEVER commit this file. Keep it safe.
// Usage: node sign.js <订单号>
// Outputs: verification code for the buyer

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const KEY_FILE = path.join(__dirname, 'ec-key.json')

let key
if (fs.existsSync(KEY_FILE)) {
  const k = JSON.parse(fs.readFileSync(KEY_FILE, 'utf8'))
  key = crypto.createPrivateKey({ key: Buffer.from(k.private, 'base64'), format: 'der', type: 'pkcs8' })
} else {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' })
  const pubDer = publicKey.export({ format: 'der', type: 'spki' })
  const privDer = privateKey.export({ format: 'der', type: 'pkcs8' })
  fs.writeFileSync(KEY_FILE, JSON.stringify({
    public: pubDer.toString('base64'),
    private: privDer.toString('base64')
  }))
  console.log('New key pair saved to ' + KEY_FILE)
  console.log('\nPublic key (embed in activate.html):\n')
  console.log(pubDer.toString('base64'))
  key = privateKey
}

const orderNo = process.argv[2]
const deviceCode = process.argv[3] // optional
if (!orderNo) {
  console.error('Usage: node sign.js <订单号> [设备码]')
  console.error('  不指定设备码时，生成的验证码可用于任意设备')
  console.error('  指定设备码时，验证码仅限于该设备使用（更安全）')
  process.exit(1)
}

// Sign: orderNo + deviceCode (if provided)
const toSign = orderNo + (deviceCode || '')
const sign = crypto.createSign('sha256')
sign.update(Buffer.from(toSign, 'utf8'))
const sig = sign.sign({ key, dsaEncoding: 'ieee-p1363' }).toString('base64url')

console.log('\n订单号: ' + orderNo)
if (deviceCode) console.log('设备码: ' + deviceCode)
console.log('验证码: ' + sig)
console.log('\n将验证码发给买家即可。')
