import React, { ChangeEvent, ReactElement, useEffect } from 'react'
import WalletConnect from 'walletconnect'
import StarkwareProvider from '@authereum/starkware-provider'

function App () {
  const [provider, setProvider] = React.useState<any>(null)
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
            vaultId: '5'
          },
          to: {
            starkKey:
              '0x0779f740681278532a60efcc9f277bae69c227a8cb07307cd8d1e6cf2b5635ea',
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
  const [orderParams, setOrderParams] = React.useState<string>(() => {
    return (
      localStorage.getItem('orderParams') ||
      JSON.stringify(
        {
          sell: {
            type: 'ETH',
            data: {
              quantum: '10'
            },
            amount: '1',
            vaultId: '1'
          },
          buy: {
            type: 'ETH',
            data: {
              quantum: '10'
            },
            amount: '1',
            vaultId: '5'
          },
          nonce: '1597237097',
          expirationTimestamp: `${Math.floor(Date.now() / (1000 * 3600)) + 720}`
        },
        null,
        2
      )
    )
  })
  const [orderSignature, setOrderSignature] = React.useState<string>('')
  const [depositParams, setDepositParams] = React.useState<string>(() => {
    return (
      localStorage.getItem('depositParams') ||
      JSON.stringify(
        {
          amount: '100000000000000000',
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

  useEffect(() => {
    if (wc) {
      setProvider(StarkwareProvider.fromWalletConnect(wc as any))
    }
  }, [wc])

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
      if (!provider) return
      const { layer, application, index } = JSON.parse(dappConfig)
      try {
        const starkKey = await provider.account({ layer, application, index })
        setStarkKey(starkKey)
      } catch (err) {
        alert(err.message)
      }

      try {
        const accounts = await provider.requestAccounts()
        setAccountAddress(accounts[0])
      } catch (err) {
        alert(err.message)
      }
    }

    update()
  }, [dappConfig, provider])

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
    const msg = nonce
    try {
      const sig = await provider.personalSign(msg)
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
      const txhash = await provider.registerUser(payload)
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
      const txhash = await provider.deposit(payload)
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
      const txhash = await provider.withdraw(payload)
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
      const starkSignature = await provider.transfer(payload)
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

  const handleOrderParamsChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const params = event.target.value
    setOrderParams(params)
    localStorage.setItem('orderParams', params)
  }
  const limitOrder = async () => {
    try {
      const payload = JSON.parse(orderParams)
      const starkSignature = await provider.createOrder(payload)
      setOrderSignature(starkSignature)
    } catch (err) {
      alert(err.message)
    }
  }
  const renderLimitOrder = () => {
    return (
      <section>
        <textarea
          value={orderParams}
          onChange={handleOrderParamsChange}
        ></textarea>
        <button onClick={limitOrder}>Limit order signature</button>
        {orderSignature && <div>Signature: {orderSignature}</div>}
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
        {renderLimitOrder()}
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
