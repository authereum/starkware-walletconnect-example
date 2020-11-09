import React, { ChangeEvent, ReactElement, useEffect, useCallback } from 'react'
import WalletConnect from 'walletconnect'

function App () {
  const [wc, setWC] = React.useState<WalletConnect | null>(null)
  const [dappConfig, setDappConfig] = React.useState<string>(() => {
    return (
      localStorage.getItem('dappConfig') ||
      JSON.stringify(
        {
          layer: 'starkex',
          application: 'starkexdemo',
          index: '0'
        },
        null,
        2
      )
    )
  })
  const [starkKey, setStarkKey] = React.useState<string>('')
  const [accountAddress, setAccountAddress] = React.useState<string>('')
  const [nonce, setNonce] = React.useState<string>(`${Date.now()}`)
  const [signature, setSignature] = React.useState<string>('')
  const [registerParams, setRegisterParams] = React.useState<string>(() => {
    return (
      localStorage.getItem('registerParams') ||
      JSON.stringify(
        {
          ethKey: '',
          operatorSignature: ''
        },
        null,
        2
      )
    )
  })
  const [registerTx, setRegisterTx] = React.useState<string>('')
  const [transferParams, setTransferParams] = React.useState<string>(() => {
    return (
      localStorage.getItem('transferParams') ||
      JSON.stringify(
        {
          from: {
            starkKey: '',
            vaultId: '5'
          },
          to: {
            starkKey: '',
            vaultId: '10'
          },
          asset: {
            type: 'ETH',
            data: {
              quantum: '10'
            }
          },
          amount: '1',
          nonce: '123',
          expirationTimestamp: `${Math.floor(Date.now() / (1000 * 3600)) + 720}`
        },
        null,
        2
      )
    )
  })
  const [transferSignature, setTransferSignature] = React.useState<string>('')
  const [depositParams, setDepositParams] = React.useState<string>(() => {
    return (
      localStorage.getItem('depositParams') ||
      JSON.stringify(
        {
          amount: '1',
          asset: {
            type: 'ETH',
            data: {
              quantum: '10'
            }
          },
          vaultId: '10'
        },
        null,
        2
      )
    )
  })
  const [depositTx, setDepositTx] = React.useState<string>('')
  const [withdrawParams, setWithdrawParams] = React.useState<string>(() => {
    return (
      localStorage.getItem('withdrawParams') ||
      JSON.stringify(
        {
          asset: {
            type: 'ETH',
            data: {
              quantum: '10'
            }
          },
          vaultId: '10'
        },
        null,
        2
      )
    )
  })
  const [withdrawTx, setWithdrawTx] = React.useState<string>('')

  const sendRequest = useCallback(
    (method: string, params: any = {}) => {
      if (!wc) return
      const customRequest = {
        id: Date.now(),
        jsonrpc: '2.0',
        method,
        params
      }
      return wc?.connector?.sendCustomRequest(customRequest)
    },
    [wc]
  )

  const connect = async () => {
    const wc = new WalletConnect()
    await wc.connect()
    wc?.connector?.on('disconnect', () => {
      setStarkKey('')
      setAccountAddress('')
    })
    setWC(wc)
  }
  const disconnect = async () => {
    wc?.connector?.killSession()
    setWC(null)
  }

  useEffect(() => {
    const update = async () => {
      if (!wc) return
      const { layer, application, index } = JSON.parse(dappConfig)
      try {
        const { starkKey } = await sendRequest('stark_account', {
          layer,
          application,
          index
        })
        setStarkKey(starkKey)
      } catch (err) {
        alert(err.message)
      }

      try {
        const accounts = await sendRequest('eth_requestAccounts')
        setAccountAddress(accounts[0])
      } catch (err) {
        alert(err.message)
      }
    }

    update()
  }, [wc, sendRequest, dappConfig])

  const renderStarkKey = () => {
    return (
      <section>
        <div>network: Ropsten</div>
        <div>stark key: {starkKey}</div>
        <div>account address: {accountAddress}</div>
        <div>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      </section>
    )
  }
  const handleNonceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNonce(event.target.value)
  }
  const signNonce = async () => {
    const address = wc?.connector?.accounts[0]
    const msg = nonce
    try {
      const sig = await sendRequest('personal_sign', [msg, address])
      setSignature(sig)
    } catch (err) {
      alert(err.message)
    }
  }
  const renderSignature = () => {
    return (
      <section>
        <div>
          <input type='text' value={nonce} onChange={handleNonceChange} />
        </div>
        <button onClick={signNonce}>Sign nonce</button>
        {signature && <div>signature: {signature}</div>}
      </section>
    )
  }

  const handleRegisterParamsChange = (
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    const params = event.target.value
    setRegisterParams(params)
    localStorage.setItem('registerParams', params)
  }
  const register = async () => {
    try {
      const payload = JSON.parse(registerParams)
      const { txhash } = await sendRequest('stark_register', payload)
      setRegisterTx(txhash)
    } catch (err) {
      alert(err.message)
    }
  }
  const renderRegister = () => {
    return (
      <section>
        <textarea
          value={registerParams}
          onChange={handleRegisterParamsChange}
        ></textarea>
        <button onClick={register}>Register</button>
        {registerTx && <div>Tx hash: {registerTx}</div>}
      </section>
    )
  }

  const handleDepositParamsChange = (
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    const params = event.target.value
    setDepositParams(params)
    localStorage.setItem('depositParams', params)
  }
  const deposit = async () => {
    try {
      const payload = JSON.parse(depositParams)
      const { txhash } = await sendRequest('stark_deposit', payload)
      setDepositTx(txhash)
    } catch (err) {
      alert(err.message)
    }
  }
  const renderDeposit = () => {
    return (
      <section>
        <textarea
          value={depositParams}
          onChange={handleDepositParamsChange}
        ></textarea>
        <button onClick={deposit}>Deposit</button>
        {depositTx && <div>Tx hash: {depositTx}</div>}
      </section>
    )
  }

  const handleWithdrawParamsChange = (
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    const params = event.target.value
    setWithdrawParams(params)
    localStorage.setItem('withdrawParams', params)
  }
  const withdraw = async () => {
    try {
      const payload = JSON.parse(withdrawParams)
      const { txhash } = await sendRequest('stark_withdraw', payload)
      setWithdrawTx(txhash)
    } catch (err) {
      alert(err.message)
    }
  }
  const renderWithdraw = () => {
    return (
      <section>
        <textarea
          value={withdrawParams}
          onChange={handleWithdrawParamsChange}
        ></textarea>
        <button onClick={withdraw}>Withdraw</button>
        {withdrawTx && <div>Tx hash: {withdrawTx}</div>}
      </section>
    )
  }

  const handleTransferParamsChange = (
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    const params = event.target.value
    setTransferParams(params)
    localStorage.setItem('transferParams', params)
  }
  const transfer = async () => {
    try {
      const payload = JSON.parse(transferParams)
      const { starkSignature } = await sendRequest('stark_transfer', payload)
      setTransferSignature(starkSignature)
    } catch (err) {
      alert(err.message)
    }
  }
  const renderTransfer = () => {
    return (
      <section>
        <textarea
          value={transferParams}
          onChange={handleTransferParamsChange}
        ></textarea>
        <button onClick={transfer}>Transfer signature</button>
        {transferSignature && <div>Signature: {transferSignature}</div>}
      </section>
    )
  }

  const renderConnected = () => {
    return (
      <div>
        {renderStarkKey()}
        {renderSignature()}
        {renderRegister()}
        {renderDeposit()}
        {renderWithdraw()}
        {renderTransfer()}
      </div>
    )
  }
  const handleDappConfig = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const config = event.target.value
    setDappConfig(config)
    localStorage.setItem('dappConfig', config)
  }
  const clearLocalStorage = () => {
    localStorage.clear()
  }
  const renderDisconnected = () => {
    return (
      <div>
        <section>
          <div>network: Ropsten</div>
        </section>
        <section>
          <div>dapp config</div>
          <textarea value={dappConfig} onChange={handleDappConfig}></textarea>
        </section>
        <section>
          <div>Not connected</div>
          <button onClick={connect}>Connect wallet</button>
          <button onClick={clearLocalStorage}>clear local storage</button>
        </section>
      </div>
    )
  }

  const children: ReactElement = starkKey
    ? renderConnected()
    : renderDisconnected()
  return (
    <main>
      <h1>WalletConnect StarkWare dapp example</h1>
      {children}
    </main>
  )
}

export default App
