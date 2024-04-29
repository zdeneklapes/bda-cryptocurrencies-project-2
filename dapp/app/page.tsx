'use client';
import React, {createContext, useState, useEffect, useContext} from 'react';
import Web3 from 'web3';

// type Web3ContextType = {
//     web3: Web3,
//     setWeb3: (web3: Web3) => void,
//     balance: string,
//     setBalance: (balance: string) => void,
//     account: string,
//     setAccount: (account: string) => void,
//     receiverAddress: string,
//     setReceiverAddress: (receiverAddress: string) => void,
//     amount: string,
//     setAmount: (amount: string) => void,
//     delegateAddress: string,
//     setDelegateAddress: (delegateAddress: string) => void,
//     delegationAmount: string,
//     setDelegationAmount: (delegationAmount: string) => void
// };
// const Web3Context = createContext({} as Web3ContextType);
// type ChildrenProps = {
//     children: React.ReactNode;
// };
//
// const Web3Provider = ({children}: ChildrenProps) => {
//     const [web3, setWeb3] = useState(null);
//     const [balance, setBalance] = useState('0');
//     const [account, setAccount] = useState(null);
//     const [receiverAddress, setReceiverAddress] = useState('');
//     const [amount, setAmount] = useState('');
//     const [delegateAddress, setDelegateAddress] = useState('');
//     const [delegationAmount, setDelegationAmount] = useState('');
//
//     const value = {
//         web3, setWeb3,
//         balance, setBalance,
//         account, setAccount,
//         receiverAddress, setReceiverAddress,
//         amount, setAmount,
//         delegateAddress, setDelegateAddress,
//         delegationAmount, setDelegationAmount
//     };
//     console.log('Web3Provider', value);
//
//     return (
//         <Web3Context.Provider {...value}>
//             {children}
//         </Web3Context.Provider>
//     );
// };
//
// export default function Home() {
//     const {
//         web3, setWeb3,
//         balance, setBalance,
//         account, setAccount,
//         receiverAddress, setReceiverAddress,
//         amount, setAmount,
//         delegateAddress, setDelegateAddress,
//         delegationAmount, setDelegationAmount
//     } = useContext(Web3Context);
//
//     // Now use these states and setters as needed in your component
//     return (
//         <Web3Provider>
//             <main className="flex min-h-screen flex-col items-center justify-center p-4">
//                 <div>
//
//                 </div>
//                 <h1>Welcome to Ethereum Wallet Connection Example</h1>
//                 {account ? (
//                     <div>
//                         {/* Display and interact with your context state */}
//                         <p>Connected with: <strong>{account}</strong></p>
//                         <p>Balance: {balance} ETH</p>
//                         {/* Other UI components */}
//                     </div>
//                 ) : (
//                     <button onClick={() => setAccount('Dummy Account')}>Connect to Ethereum Wallet</button>
//                 )}
//             </main>
//         </Web3Provider>
//     );
// }
//
export default function Home() {
    const [web3, setWeb3] = useState({} as Web3);
    const [balance, setBalance] = useState('0');
    const [account, setAccount] = useState({} as string);
    const [receiverAddress, setReceiverAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [delegateAddress, setDelegateAddress] = useState('');
    const [delegationAmount, setDelegationAmount] = useState('');

    useEffect(() => {
        if (typeof window.ethereum !== 'undefined') {
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);
        } else {
            console.error("MetaMask is not installed!");
        }
    }, []);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <h1>Welcome to Ethereum Wallet Connection by Zdenek Lapes (lapes.zdenek@gmail.com)</h1>
            <div>
                {
                    account
                        ? <WalletConnected
                            account={[account, setAccount]}
                            balance={[balance, setBalance]}
                            receiverAddress={[receiverAddress, setReceiverAddress]}
                            amount={[amount, setAmount]}
                            delegateAddress={[delegateAddress, setDelegateAddress]}
                            delegationAmount={[delegationAmount, setDelegationAmount]}
                            web3={web3}/>
                        : <ConnectWallet account={[account, setAccount]}/>
                }
            </div>
        </main>
    );
}

// type Maybe<T> = NonNullable<T> | undefined;
// import {Maybe} from "@metamask/utils";

type AccountProps = {
    account: [string, (account: string) => void];
};

function ConnectWallet(props: AccountProps): JSX.Element {
    const [account, setAccount] = props.account;

    async function connectWallet() {
        try {
            if (!window.ethereum) {
                throw new Error("Ethereum wallet is not installed. Please install MetaMask or another wallet provider.");
            }
            const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
            // TODO: Continue here:
            //  - Fix types adn setup event and listening for event from blockchain
            //  - Show userBalance, TransferToday, LimitPerDay, MintToday if is MintAdmin
            //  - Show input for sending tokens
            //  - Show input for approve AdminMint
            //  - Show input for approve SignMint
            //  - Show input for approve TransferLimit
            setAccount(accounts[0]);
        } catch (error) {
            console.error("Failed to connect wallet", error);
        }
    }

    return (
        <button onClick={connectWallet} className="mt-5 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-700">
            Connect to Ethereum Wallet
        </button>
    )
}

type WalletConnectedProps = {
    account: [string, (account: string) => void];
    balance: [string, (balance: string) => void];
    receiverAddress: [string, (receiverAddress: string) => void];
    amount: [string, (amount: string) => void];
    delegateAddress: [string, (delegateAddress: string) => void];
    delegationAmount: [string, (delegationAmount: string) => void];
    web3: Web3;
};

function WalletConnected(props: WalletConnectedProps): JSX.Element {
    const [account, setAccount] = props.account;
    const [balance, setBalance] = props.balance;
    const [receiverAddress, setReceiverAddress] = props.receiverAddress;
    const [amount, setAmount] = props.amount;
    const [delegateAddress, setDelegateAddress] = props.delegateAddress;
    const [delegationAmount, setDelegationAmount] = props.delegationAmount;
    const web3 = props.web3;

    useEffect(() => {
        if (account && web3) {
            updateBalance();
        }
    }, [account, web3]);

    async function updateBalance() {
        const balanceWei = await web3.eth.getBalance(account);
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
        setBalance(balanceEth);
    }

    async function sendTokens() {
        if (!receiverAddress || !amount) return;
        await web3.eth.sendTransaction({
            from: account,
            to: receiverAddress,
            value: web3.utils.toWei(amount, 'ether')
        }).then(() => {
            alert('Tokens sent successfully');
            updateBalance(); // Refresh balance after transaction
        }).catch((error) => {
            console.error('Error sending tokens', error);
            alert('Failed to send tokens');
        });
    }

    return (
        <div>
            <p>Connected with: <strong>{account}</strong></p>
            <p>Balance: {balance} ETH</p>
            <div>
                <h2>Send Tokens</h2>
                <input
                    type="text"
                    value={receiverAddress}
                    onChange={e => setReceiverAddress(e.target.value)}
                    placeholder="Receiver address e.g. 0xE9F9..."
                />
                <input
                    type="text"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Amount e.g. 10"
                />
                <button onClick={sendTokens}>Send</button>
            </div>
            <div>
                <h2>Approve Delegation</h2>
                <input
                    type="text"
                    value={delegateAddress}
                    onChange={e => setDelegateAddress(e.target.value)}
                    placeholder="Delegate address e.g. 0xE9F9..."
                />
                <input
                    type="text"
                    value={delegationAmount}
                    onChange={e => setDelegationAmount(e.target.value)}
                    placeholder="Amount e.g. 10"
                />
                <button onClick={() => {/* Approve delegation logic here */
                }}>Approve
                </button>
            </div>
        </div>

    )
}

