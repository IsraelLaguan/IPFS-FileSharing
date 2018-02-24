const IPFS = require('ipfs')
const Log = require('ipfs-log')

const dataPath = './ipfs/examples/log'

const ipfs = new IPFS({
  repo: dataPath + '/ipfs',
  start: false,
  EXPERIMENTAL: {
    pubsub: true
  },
})

ipfs.on('error', (err) => console.error(err))
ipfs.on('ready', async () => {

  let log1 = new Log(ipfs)
  let log2 = new Log(ipfs)
  let log3 = new Log(ipfs)
  const log  = new Log(ipfs)
  let hash
  try {
    await log1.append('one')
    await log1.append('two')
    await log2.append('three')
    // Join the logs
    await log3.join(log1, -1, log3.id)
    await log3.join(log2, -1, log3.id)
    // Add one more
    await log3.append('four')
    console.log("created log 1 \n")
    console.log(log3.values)
    await log.append({some: "data"})
    await log.append('text')
    console.log("created log 2 ",log.values.map(e => e.payload),log.id)
    hash=log.toMultihash(ipfs)
    .then(
      hash => {let loggy =Log.fromMultihash(ipfs, hash)
        .then(loggy => console.log("log 2 retrieved from ipfs",loggy))
      }
      
      
    )
    
  } catch (e) {
    console.error(e)
  }
  console.log("printed log 1",log3.toString())
  // four
  // └─two
  //   └─one
  // └─three
  
   
})