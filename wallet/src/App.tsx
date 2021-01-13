import React, { useState, useEffect } from 'react'
import { providers, Wallet } from 'ethers'
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
  const [connectUri, setConnectUri] = useState<string>('')
  const [connected, setConnected] = useState<boolean | undefined>(false)
  const [callRequests, setCallRequests] = useState<any[]>([])
  const [mnemonic, setMnemonic] = useState<string>(defaultMnemonic)
  const [privateKey, setPrivateKey] = useState<string>(defaultPrivateKey)
  const [accountAddress, setAccountAddress] = useState<string>('')
  const [contractAddress, setContractAddress] = useState<string>(
    defaultContractAddress
  )
  const [provider, setProvider] = useState<StarkwareProvider>()

  useEffect(() => {
    try {
      const starkWallet = new StarkwareWallet(mnemonic, rpcProvider, store)
      const signerWallet = new Wallet(privateKey, rpcProvider)
      const starkwareProvider = new StarkwareProvider(
        starkWallet,
        signerWallet,
        contractAddress
      )
      starkwareProvider.setDebug(true)
      console.debug('address', signerWallet.address)
      setAccountAddress(signerWallet.address)
      setTimeout(() => {
        setProvider(starkwareProvider)
      }, 100)
    } catch (err) {
      console.error(err)
    }
  }, [mnemonic, privateKey, contractAddress])

  useEffect(() => {
    setConnected(provider?.wc.connected)
  }, [setConnected, provider])

  useEffect(() => {
    if (!accountAddress) return
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
      setConnected(provider?.wc.connected)
    }
    const handleSessionRequest = async (err: Error | null, payload: any) => {
      console.debug('walletConnector.on("session_request")', payload)
      if (err) {
        console.error(err)
        return
      }

      console.debug('approve session', accountAddress)
      provider?.wc.approveSession({
        chainId: networkId,
        accounts: [accountAddress]
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

    provider?.wc.on('connect', handleConnect)
    provider?.wc.on('disconnect', handleDisconnect)
    provider?.wc.on('session_request', handleSessionRequest)
    provider?.wc.on('session_update', handleSessionUpdate)
    provider?.wc.on('call_request', handleCallRequest)
    provider?.wc.on('wc_sessionRequest', handleWcSessionRequest)
    provider?.wc.on('wc_sessionUpdate', handleWcSessionUpdate)
    provider?.wc.on('error', handleError)
    provider?.wc.on('transport_open', handleTransportOpen)
    provider?.wc.on('transport_close', handleTransportClose)

    return () => {
      provider?.wc.off('connect', handleConnect)
      provider?.wc.off('disconnect', handleDisconnect)
      provider?.wc.off('session_request', handleSessionRequest)
      provider?.wc.off('session_update', handleSessionUpdate)
      provider?.wc.off('call_request', handleCallRequest)
      provider?.wc.off('wc_sessionRequest', handleWcSessionRequest)
      provider?.wc.off('wc_sessionUpdate', handleWcSessionUpdate)
      provider?.wc.off('error', handleError)
      provider?.wc.off('transport_open', handleTransportOpen)
      provider?.wc.off('transport_close', handleTransportClose)
    }
  }, [provider, callRequests, accountAddress])

  const handleConnectUri = async (event: any) => {
    const connectUri = event.target.value
    setConnectUri(connectUri)
  }
  const clearLocalStorage = () => {
    localStorage.clear()
  }
  const connect = async () => {
    if (!connectUri) {
      return
    }
    await provider?.wc.connect(connectUri)
    setConnected(provider?.wc.connected)
  }
  const disconnect = () => {
    localStorage.clear()
    provider?.wc.killSession()
    setConnectUri('')
    setConnected(false)
    setAccountAddress('')
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

      provider?.wc.approveRequest(response)
    } catch (err) {
      provider?.wc.rejectRequest({
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
    provider?.wc.rejectRequest({
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
