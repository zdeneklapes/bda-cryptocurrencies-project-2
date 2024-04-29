'use client';
import React, {createContext, useState, useEffect, useContext} from 'react';
import Web3 from 'web3';
import BDATokenJSON from './BDAToken.json';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import SendTokenForm from "./components/SendTokenForm";


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
            console.error("MetaMask is not installed!");
        }
        const web3Instance = new Web3(window.ethereum);
        web3Instance.eth.net.getId().then(console.log);
        console.log("web3Instance", web3Instance);
        console.log(web3Instance.currentProvider);
        setWeb3(web3Instance);
    }, [account]);

    useEffect(() => {
        if (!web3) {
            console.error("Web3 is not initialized");
            return;
        }
        const contractABI = BDATokenJSON.abi;
        const contractAddress = '0x345cA3e014Aaf5dcA488057592ee47305D9B3e10';
        const contractInstance = new web3.eth.Contract(contractABI, contractAddress);
        setupEventListeners(contractInstance);
        setContract(contractInstance);
    }, [web3]);

    function setupEventListeners(contractInstance) {
        contractInstance.events.TransferBDAToken({}, (error, event) => {
            if (error) {
                console.error('Error on event', error);
                return;
            }
            console.log('Transfer event:', event);
            updateBalance();
        });
    }

    async function connectWallet() {
        try {
            if (!window.ethereum) {
                throw new Error("Ethereum wallet is not installed. Please install MetaMask or another wallet provider.");
            }
            const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
            setAccount(accounts[0]);
            // const web3Instance = new window.Web3(window.ethereum);
            // setWeb3(web3Instance);
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
        const amountInWei = web3.utils.toWei(amount, 'ether');
        await contract.methods.transfer(receiverAddress, amountInWei).send({from: account});
    }

    async function mintTokens() {
        await contract.methods.mint([], []).send({from: account});
    }

    useEffect(() => {
        const fetchRoles = async () => {
            const accounts = await web3.eth.getAccounts();
            console.log('Accounts:', accounts);
            const roles = await contract.methods.getUserRoles().call({from: accounts[0]});
            console.log('Roles:', roles);
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
            <div class="header-container">
                <h1 class="header">Welcome to Ethereum Wallet Connection Example</h1>
                <h2 class="sub-header">
                    Created by <a href="https://github.com/zdeneklapes" target="_blank">Zdenek Lapes on GitHub</a> | <a href="https://twitter.com/zdeneklapes" target="_blank">Twitter</a>
                </h2>
            </div>
            {account ? (
                <div>
                <div className="info-container">
                        <p className="info-text"><strong>Connected with:</strong> {account}</p>
                        <p className="info-text"><strong>Balance:</strong> {balance} ETH</p>
                        <p className="info-text"><strong>Balance:</strong> {balance} BT</p>
                        <p className="info-text"><strong>Minted Today:</strong> {mintedToday} tokens</p>
                        <p className="info-text"><strong>Mint Limit / Day:</strong> {mintLimit} tokens</p>
                        {/*<p className="info-text"><strong>Available to Mint:</strong> {mintLimit - mintedToday} tokens</p>*/}
                        <p className="info-text"><strong>Transfer Limit / Day:</strong> {transferLimit} tokens</p>
                        {/*<p className="info-text"><strong>Available to Transfer:</strong> {transferLimit} tokens</p>*/}
                        <p className="info-text"><strong>Roles:</strong> {userRoles.length > 0 ? userRoles.join(', ') : 'No roles found'}</p>
                    </div>
                    <SendTokenForm />
                    {/*<div>*/}
                    {/*    <h2>Send Tokens</h2>*/}
                    {/*    <input*/}
                    {/*        type="text"*/}
                    {/*        value={receiverAddress}*/}
                    {/*        onChange={e => setReceiverAddress(e.target.value)}*/}
                    {/*        style={{color: 'black'}}*/}
                    {/*        placeholder="Receiver address e.g. 0xE9F9..."*/}
                    {/*    />*/}
                    {/*    <input*/}
                    {/*        type="text"*/}
                    {/*        value={amount}*/}
                    {/*        onChange={e => setAmount(e.target.value)}*/}
                    {/*        style={{color: 'black'}}*/}
                    {/*        placeholder="Amount e.g. 10"*/}
                    {/*    />*/}
                    {/*    <button onClick={sendTokens}>Send</button>*/}
                    {/*</div>*/}
                </div>
            ) : (
                <button onClick={connectWallet} className="mt-5 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-700">
                    Connect to Ethereum Wallet
                </button>
            )}
        </main>
    );
}
