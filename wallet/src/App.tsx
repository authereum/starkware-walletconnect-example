import React, { useEffect } from 'react'
import { EventEmitter } from 'events'
import { providers, Wallet } from 'ethers'
import WalletConnect from '@walletconnect/client'
import StarkwareProvider from '@authereum/starkware-provider'
import StarkwareWallet from '@authereum/starkware-wallet'

const networkId = 3
const rpcProvider = new providers.JsonRpcProvider(
  'https://ropsten.rpc.authereum.com'
)
const defaultMnemonic =
  localStorage.getItem('mnemonic') ||
  'source mask employ able profit left life situate client divert scale meat police twelve another virus erode hospital area rely spirit pass end reject'
const defaultPrivateKey =
  '0xb0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773'
const defaultContractAddress =
  localStorage.getItem('contractAddress') ||
  '0x5FedCE831BD3Bdb71F938EC26f984c84f40dB477' // ropsten

const clone = (arr: any[]) => {
  return arr.map((x: any) => Object.assign({}, x))
}

const store = {
  set: async (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (err) {
      localStorage.setItem(key, data)
    }
  },
  get: async (key: string) => {
    try {
      return JSON.parse(localStorage.getItem(key) as string)
    } catch (err) {
      localStorage.getItem(key)
    }
  },
  remove: async (key: string) => {
    localStorage.removeItem(key)
  }
}

function App () {
  const [ee] = React.useState(() => new EventEmitter())
  const [wc, setWC] = React.useState<WalletConnect>()
  const [connectUri, setConnectUri] = React.useState<string>('')
  const [connected, setConnected] = React.useState<boolean>(false)
  const [callRequests, setCallRequests] = React.useState<any[]>([])
  const [mnemonic, setMnemonic] = React.useState<string>(defaultMnemonic)
  const [privateKey, setPrivateKey] = React.useState<string>(defaultPrivateKey)
  const [accountAddress, setAccountAddress] = React.useState<string>('')
  const [contractAddress, setContractAddress] = React.useState<string>(
    defaultContractAddress
  )
  const [provider, setProvider] = React.useState<StarkwareProvider>()

  const getSession = () => {
    try {
      // localStorage 'walletconnect' value is set by walletconnect library
      const session = localStorage.getItem('walletconnect')
      if (!session) {
        return null
      }

      return JSON.parse(session)
    } catch (err) {
      return null
    }
  }

  useEffect(() => {
    try {
      const starkWallet = new StarkwareWallet(mnemonic, rpcProvider, store)
      const signerWallet = new Wallet(privateKey, rpcProvider)
      const starkwareProvider = new StarkwareProvider(
        starkWallet,
        signerWallet,
        contractAddress
      )
      setProvider(starkwareProvider)
      setAccountAddress(signerWallet.address)
    } catch (err) {
      console.error(err)
    }
  }, [mnemonic, privateKey, contractAddress])

  useEffect(() => {
    const session = getSession()
    if (session) {
      const walletConnector = new WalletConnect({ session })
      setWC(walletConnector)
      setConnected(walletConnector.connected)
    }
  }, [setConnected])

  // walletconnect doesn't have a way to unsubscribe from event emitter,
  // so we use a custom event emitter as a workaround.
  useEffect(() => {
    const events = [
      'connect',
      'disconnect',
      'session_request',
      'session_update',
      'call_request',
      'wc_sessionRequest',
      'wc_sessionUpdate',
      'error',
      'transport_open',
      'transport_close'
    ]
    for (let name of events) {
      wc?.on(name, (...args: any[]) => ee.emit(name, ...args))
    }
  }, [wc, ee])

  useEffect(() => {
    if (!wc) return

    const handleCallRequest = async (err: Error | null, payload: any) => {
      console.debug('walletConnector.on("call_request")', payload)
      if (err) {
        console.error(err)
        return
      }

      setCallRequests(clone(callRequests).concat(payload))
    }
    const handleConnect = (err: Error | null, payload: any) => {
      console.debug('walletConnector.on("connect")', payload)
      if (err) {
        console.error(err)
        return
      }

      setConnected(true)
    }
    const handleDisconnect = (err: Error | null, payload: any) => {
      console.debug('walletConnector.on("disconnect")', payload)
      if (err) {
        console.error(err)
        return
      }

      setConnectUri('')
      setConnected(wc.connected)
    }
    const handleSessionRequest = async (err: Error | null, payload: any) => {
      console.debug('walletConnector.on("session_request")', payload)
      if (err) {
        console.error(err)
        return
      }

      wc.approveSession({
        chainId: networkId,
        accounts: []
      })
    }
    const handleSessionUpdate = (err: Error | null, payload: any) => {
      console.debug('walletConnector.on("session_update")', payload)
      if (err) {
        console.error(err)
        return
      }
    }
    const handleWcSessionRequest = async (err: Error | null, payload: any) => {
      console.debug('walletConnector.on("wc_sessionRequest")', payload)
      if (err) {
        console.error(err)
        return
      }
    }
    const handleWcSessionUpdate = (err: Error | null, payload: any) => {
      console.debug('walletConnector.on("wc_sessionUpdate")', payload)
      if (err) {
        console.error(err)
      }
    }
    const handleError = (err: Error | null) => {
      console.error('walletConnector.on("error")', err)
    }
    const handleTransportOpen = (err: Error | null, payload: any) => {
      console.debug('walletConnector.on("transport_open")', payload)
      if (err) {
        console.error(err)
        return
      }
    }
    const handleTransportClose = (err: Error | null, payload: any) => {
      console.debug('walletConnector.on("transport_close")', payload)
      if (err) {
        console.error(err)
        return
      }
    }

    ee.on('connect', handleConnect)
    ee.on('disconnect', handleDisconnect)
    ee.on('session_request', handleSessionRequest)
    ee.on('session_update', handleSessionUpdate)
    ee.on('call_request', handleCallRequest)
    ee.on('wc_sessionRequest', handleWcSessionRequest)
    ee.on('wc_sessionUpdate', handleWcSessionUpdate)
    ee.on('error', handleError)
    ee.on('transport_open', handleTransportOpen)
    ee.on('transport_close', handleTransportClose)

    return () => {
      ee.off('connect', handleConnect)
      ee.off('disconnect', handleDisconnect)
      ee.off('session_request', handleSessionRequest)
      ee.off('session_update', handleSessionUpdate)
      ee.off('call_request', handleCallRequest)
      ee.off('wc_sessionRequest', handleWcSessionRequest)
      ee.off('wc_sessionUpdate', handleWcSessionUpdate)
      ee.off('error', handleError)
      ee.off('transport_open', handleTransportOpen)
      ee.off('transport_close', handleTransportClose)
    }
  }, [ee, wc, provider, callRequests])

  const handleConnectUri = async (event: any) => {
    const connectUri = event.target.value
    setConnectUri(connectUri)
  }
  const clearLocalStorage = () => {
    localStorage.clear()
  }
  const connect = async () => {
    const walletConnector = new WalletConnect({
      uri: connectUri
    })

    setConnected(walletConnector.connected)

    if (!walletConnector.connected) {
      await walletConnector.createSession()
    }

    setWC(walletConnector)
  }
  const disconnect = () => {
    wc?.killSession()
  }
  const approve = async (idx: any) => {
    const callRequest = callRequests.splice(idx, 1)[0]

    try {
      const response = await provider?.resolve(callRequest, {
        gasLimit: '0x7a120', // 500k
        gasPrice: '0x6fc23ac00' // 30gwei
      })
      console.log('RESPONSE', response)
      if (response.error) {
        throw new Error(response.error.message)
      }

      wc?.approveRequest(response)
    } catch (err) {
      wc?.rejectRequest({
        id: callRequest.id,
        error: {
          message: err.message
        }
      })
    }

    setCallRequests(clone(callRequests))
  }
  const reject = (idx: any) => {
    const callRequest = callRequests.splice(idx, 1)[0]
    wc?.rejectRequest({
      id: callRequest.id,
      error: {
        message: 'cancelled'
      }
    })
    setCallRequests(clone(callRequests))
  }
  const handleMnemonic = (event: any) => {
    const mnemonic = event.target.value
    setMnemonic(mnemonic)
    localStorage.setItem('mnemonic', mnemonic)
  }
  const handlePrivateKey = (event: any) => {
    const privateKey = event.target.value
    setPrivateKey(privateKey)
    localStorage.setItem('privateKey', privateKey)
  }
  const handleContractAddress = (event: any) => {
    const contractAddress = event.target.value
    setContractAddress(contractAddress)
    localStorage.setItem('contractAddress', contractAddress)
  }

  const renderCallRequest = (callRequest: any, idx: number) => {
    return (
      <section key={callRequest.id}>
        <div>
          <pre>{JSON.stringify(callRequest, null, 2)}</pre>
        </div>
        <div>
          <button onClick={approve.bind(null, idx)}>Approve</button>
          <button onClick={reject.bind(null, idx)}>Reject</button>
        </div>
      </section>
    )
  }
  const renderCallRequests = () => {
    return callRequests.map(renderCallRequest)
  }
  const renderConnected = () => {
    return (
      <div>
        <section>
          <div>network: Ropsten</div>
          <div>signer address: {accountAddress}</div>
          <div>contract address: {contractAddress}</div>
        </section>
        <section>
          <div>Connected</div>
          <div>
            <button onClick={disconnect}>Disconnect</button>
          </div>
        </section>
        {renderCallRequests()}
      </div>
    )
  }
  const renderDisconnected = () => {
    return (
      <div>
        <section>
          <label>network: Ropsten</label>
        </section>
        <section>
          <label>Stark mnemonic</label>
          <div>
            <input
              type='mnemonic'
              placeholder='mnemonic'
              value={mnemonic}
              onChange={handleMnemonic}
            />
          </div>
        </section>
        <section>
          <label>Transaction signer private key</label>
          <div>
            <input
              type='privateKey'
              placeholder='signer private key'
              value={privateKey}
              onChange={handlePrivateKey}
            />
          </div>
        </section>
        <section>
          <label>StarkEx contract</label>
          <div>
            <input
              type='contractAddress'
              placeholder='contract address'
              value={contractAddress}
              onChange={handleContractAddress}
            />
          </div>
        </section>
        <section>
          <label>Connect URI</label>
          <div>
            <input
              type='connectUri'
              placeholder='wc:'
              value={connectUri}
              onChange={handleConnectUri}
            />
          </div>
          <button onClick={connect}>Connect</button>
          <button onClick={clearLocalStorage}>clear local storage</button>
        </section>
      </div>
    )
  }

  const children = connected ? renderConnected() : renderDisconnected()

  return (
    <main>
      <h1>WalletConnect StarkWare wallet example</h1>
      {children}
    </main>
  )
}

export default App
