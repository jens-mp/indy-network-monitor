import { base58 } from '@scure/base'
import { webcrypto } from 'crypto'
import { GetValidatorInfoAction, PoolCreate } from '@hyperledger/indy-vdr-nodejs'

const seed = process.env["SEED"]!!
const poolTransactions = '' // Insert pool_transactions_genesis here

export async function wait(time = 3000): Promise<void> {
  return await new Promise((resolve) => setTimeout(resolve, time))
}

function gcAndPrintMemoryStatistics() {
  if (!global.gc) {
    console.error('Run with --expose-gc')
    return
  }

  global.gc()
  const memory = process.memoryUsage()
  const now = new Date().toUTCString()

  console.log(`HEAPSTAT\t${now}\t${memory.rss}\t${memory.heapTotal}\t${memory.heapUsed}\t${memory.external}\t${memory.arrayBuffers}`)
}

async function startServer() {
  console.log(`HEAPSTAT\ttimestamp\trss\theapTotal\theapUsed\texternal\tarrayBuffers`)

  // @ts-ignore
  if (!globalThis.crypto) globalThis.crypto = webcrypto
  const noble = await import('@noble/ed25519')

  const pool = new PoolCreate({ parameters: { transactions: poolTransactions }, })

  while (true) {
    try {
      await pool.refresh()
      break
    } catch (error) {
      console.error(`Error refreshing pool`)
      console.error({ error })
    }

    await wait(10 * 1000)
  }

  const privateKey = Buffer.from(seed, 'utf8').toString('hex')
  const publicKey = await noble.getPublicKeyAsync(privateKey)
  const did = base58.encode(publicKey.slice(0, 16))

  gcAndPrintMemoryStatistics()

  while (true) {
    const action = new GetValidatorInfoAction({ submitterDid: did })

    const msgHex = Buffer.from(action.signatureInput, 'utf8').toString('hex')
    const signature = await noble.signAsync(msgHex, privateKey)
    action.setSignature({ signature })

    const start = new Date()
    const response = await pool.submitAction(action, {
      timeout: 40,
    })
    const end = new Date()

    console.log({
      duration: end.getTime() - start.getTime(),
      nodes: Object.keys(response).length,
      size: Object.values(response).map(res => res.length).reduce((sum, length) => sum + length, 0)
    })

    gcAndPrintMemoryStatistics()

    await wait(60 * 1000)
  }
}

startServer().finally()
