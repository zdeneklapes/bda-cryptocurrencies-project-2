'use client';
import React, {createContext, useState, useEffect, useContext} from 'react';
import Web3 from 'web3';
import BDATokenJSON from './BDAToken.json';
import {json} from "node:stream/consumers";

export default function Home() {
    const [web3, setWeb3] = useState(null);
    const [balance, setBalance] = useState('0');
    const [account, setAccount] = useState(null);
    const [receiverAddress, setReceiverAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [delegateAddress, setDelegateAddress] = useState('');
    const [delegationAmount, setDelegationAmount] = useState('');
    const [userRoles, setUserRoles] = useState([]);
    const [mintedToday, setMintedToday] = useState(0);
    const [mintLimit, setMintLimit] = useState(0);
    const [transferLimit, setTransferLimit] = useState(0);
    const [contract, setContract] = useState(null);

    useEffect(() => {
        if (typeof window.ethereum !== 'undefined') {
            // const web3Instance = new Web3(window.ethereum);
            const url = "http://blockchain:8545";
            const provider = new Web3.providers.HttpProvider(url);
            const web3Instance = new Web3(provider);
            setWeb3(web3Instance);
        } else {
            console.error("MetaMask is not installed!");
        }
    }, []);

    useEffect(() => {
        if (web3) {
            const contractAddress = '0x2C2B9C9a4a25e24B174f26114e8926a9f2128FE4';
            const contractABI = BDATokenJSON.abi;
            // const contractInstance = new web3.eth.Contract([contractABI], contractAddress);
            const contractInstance = new web3.eth.Contract(contractABI, contractAddress);
            // const contractInstance = new web3.eth.Contract(contractABI);
            // console.log('Contract ABI:', contractABI);
            setContract(contractInstance);
        }
    }, [web3]);

    useEffect(() => {
        if (account && web3) {
            updateBalance();
        }
    }, [account, web3]);

    async function connectWallet() {
        try {
            if (!window.ethereum) {
                throw new Error("Ethereum wallet is not installed. Please install MetaMask or another wallet provider.");
            }
            const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
            setAccount(accounts[0]);
        } catch (error) {
            console.error("Failed to connect wallet", error);
        }
    }

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

    useEffect(() => {
        // Function to fetch roles from the smart contract
        const fetchRoles = async () => {
            // console.log(contract.methods);
            const accounts = await web3.eth.getAccounts();
            const roles = await contract.methods.getUserRoles().call({from: accounts[0]});
            setUserRoles(roles); // Assuming setUserRoles updates the state with fetched roles
        };

        if (account) {
            fetchRoles();
        }
    }, [contract, account]);

    const handleDelegation = async () => {
        if (!delegateAddress || !delegationAmount) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            const accounts = await web3.eth.getAccounts();
            if (accounts.length === 0) {
                throw new Error("No accounts found. Make sure Ethereum client is connected.");
            }
            if (!account) setAccount(accounts[0]);

            // Calling the approve function on the smart contract
            const response = await contract.methods.approve(delegateAddress, web3.utils.toWei(delegationAmount, 'ether')).send({from: accounts[0]});
            console.log('Transaction response:', response);
            alert("Delegation approved successfully!");
        } catch (error) {
            console.error("Error during token delegation:", error);
            alert("Failed to delegate tokens. See the console for more details.");
        }
    };


    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <h1>Welcome to Ethereum Wallet Connection Example</h1>
            {account ? (
                <div>
                    <p>Connected with: {account}</p>
                    <p>Balance: {balance} ETH</p>
                    <p>Balance: {balance} BT</p>
                    <p>Minted Today: {mintedToday} tokens</p>
                    <p>Mint Limit: {mintLimit} tokens/day</p>
                    <p>Transfer Limit: {transferLimit} tokens/day</p>
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
                    <div>
                        <h2>Delegate Tokens</h2>
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
                        <button onClick={handleDelegation}>Delegate</button>
                    </div>

                </div>
            ) : (
                <button onClick={connectWallet} className="mt-5 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-700">
                    Connect to Ethereum Wallet
                </button>
            )}
        </main>
    );
}

