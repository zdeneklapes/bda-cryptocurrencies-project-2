'use client';
import React, {createContext, useState, useEffect, useContext, useReducer} from 'react';
import Web3 from 'web3';
import BDATokenJSON from '@/lib/BDAToken.json';

import SendTokenForm from "@/components/SendTokenForm";
import UserInfo from "@/components/UserInfo";
import HomeContext from "@/components/HomeContext";

const contractABI = BDATokenJSON.abi;
const contractAddress = '0xcfeD223fAb2A41b5a5a5F9AaAe2D1e882cb6Fe2D';

const initialState = {
    web3: null,
    balanceETH: '0',
    balanceBT: '0',
    account: null,
    receiverAddress: '',
    amount: '',
    delegateAddress: '',
    delegationAmount: '',
    userRoles: [],
    mintedToday: 0,
    mintLimit: 0,
    transferLimit: 0,
    contract: null
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_WEB3':
            return {...state, web3: action.payload};
        case 'SET_BALANCE_ETH':
            return {...state, balanceETH: action.payload};
        case 'SET_BALANCE_BT':
            return {...state, balanceBT: action.payload};
        case 'SET_ACCOUNT':
            return {...state, account: action.payload};
        case 'SET_RECEIVER_ADDRESS':
            return {...state, receiverAddress: action.payload};
        case 'SET_AMOUNT':
            return {...state, amount: action.payload};
        case 'SET_DELEGATE_ADDRESS':
            return {...state, delegateAddress: action.payload};
        case 'SET_DELEGATION_AMOUNT':
            return {...state, delegationAmount: action.payload};
        case 'SET_USER_ROLES':
            return {...state, userRoles: action.payload};
        case 'SET_MINTED_TODAY':
            return {...state, mintedToday: action.payload};
        case 'SET_MINT_LIMIT':
            return {...state, mintLimit: action.payload};
        case 'SET_TRANSFER_LIMIT':
            return {...state, transferLimit: action.payload};
        case 'SET_CONTRACT':
            return {...state, contract: action.payload};
        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}


export default function Home() {
    const [state, dispatch] = useReducer(reducer, initialState);

    function setupEventListeners(contractInstance) {
        contractInstance.events.TransferBDAToken({}, (error, event) => {
            if (error) {
                console.error('Error on event', error);
                return;
            }
            console.log('Transfer event:', event);
            // updateBalance();
        });
    }

    async function initUserWallet() {
        // Web3
        let web3Instance;
        try {
            web3Instance = new Web3(window.ethereum);
            const id = await web3Instance.eth.net.getId()
            console.log("web3Instance", web3Instance);
            console.log("id", id);
            dispatch({type: 'SET_WEB3', payload: web3Instance});
        } catch (error) {
            console.error("Failed to connect wallet", error);
        }

        // Contract
        let contract;
        try {
            contract = new web3Instance.eth.Contract(contractABI, contractAddress);
            dispatch({type: 'SET_CONTRACT', payload: contract});
        } catch (error) {
            console.error("Failed to connect contract", error);
        }

        // Accounts
        let account;
        try {
            const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
            account = accounts[0];
            dispatch({type: 'SET_ACCOUNT', payload: account});
        } catch (error) {
            console.error("Failed to connect account", error);
        }

        // Balance ETH
        try {
            const balanceWei = await web3Instance.eth.getBalance(account);
            const balance = web3Instance.utils.fromWei(balanceWei, 'ether');
            console.log('Balance ETH:', balance);
            dispatch({type: 'SET_BALANCE_ETH', payload: balance});
        } catch (error) {
            console.error("Failed to connect balance", error);
        }

        // Balance BT
        try {
            const balance = await contract.methods.balanceOf(account).call({from: account});
            const balanceNumber = Number(balance);
            console.log('Balance BT:', balanceNumber);
            dispatch({type: 'SET_BALANCE_BT', payload: balanceNumber});
        } catch (error) {
            console.error("Failed to connect balance", error);
        }

        // Roles
        try {
            const fetchedRoles = await contract.methods.getUserRoles().call({from: account});
            const userRoles = [];

            // Check for specific roles and add to the roles array
            if (fetchedRoles.isAdminMint) {
                userRoles.push('Admin Mint');
            }
            if (fetchedRoles.isAdminTransfer) {
                userRoles.push('Admin Transfer');
            }

            // Dispatch the updated roles to your application's state
            console.log('User roles:', userRoles);
            dispatch({type: 'SET_USER_ROLES', payload: userRoles});
        } catch (error) {
            console.error('Error fetching roles:', error);
        }

        // Minted today
        try {
            const mintedToday = await contract.methods.getMintedToday().call({from: account});
            const mintedTodayNumber = Number(mintedToday);
            console.log('Minted today:', mintedTodayNumber);
            dispatch({type: 'SET_MINTED_TODAY', payload: mintedTodayNumber});
        } catch (error) {
            console.error('Error fetching minted today:', error);
        }

        // Mint limit per day
        try {
            const mintLimit = await contract.methods.getMintLimit().call({from: account});
            const mintLimitNumber = Number(mintLimit);
            console.log('Mint limit:', mintLimitNumber);
            dispatch({type: 'SET_MINT_LIMIT', payload: mintLimitNumber});
        } catch (error) {
            console.error('Error fetching mint limit:', error);
        }

        // Transfered Amount
        try {
            const transferAmount = await contract.methods.getTransferedToday().call({from: account});
            const transferAmountNumber = Number(transferAmount);
            console.log('Transfer limit:', transferAmountNumber);
            dispatch({type: 'SET_TRANSFER_LIMIT', payload: transferAmountNumber});
        } catch (error) {
            console.error('Error fetching transfer limit:', error);
        }

        // Transfer limit
        try {
            const transferLimit = await contract.methods.getTransferLimit().call({from: account});
            const transferLimitNumber = Number(transferLimit);
            console.log('Transfer limit:', transferLimitNumber);
            dispatch({type: 'SET_TRANSFER_LIMIT', payload: transferLimitNumber});
        } catch (error) {
            console.error('Error fetching transfer limit:', error);
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="header-container">
                <h1 className="header">Welcome to Ethereum Wallet Connection Example</h1>
                <h2 className="sub-header">
                    Created by <a href="https://github.com/zdeneklapes" target="_blank">Zdenek Lapes on GitHub</a> | <a href="https://twitter.com/zdeneklapes" target="_blank">Twitter</a>
                </h2>
            </div>
            {state.account ? (
                <div>
                    <HomeContext.Provider value={{state, dispatch}}>
                        <UserInfo account={state.account} balanceETH={state.balanceETH} balanceBT={state.balanceBT} mintedToday={state.mintedToday} mintLimit={state.mintLimit} transferLimit={state.transferLimit} userRoles={state.userRoles}/>
                        <SendTokenForm/>
                    </HomeContext.Provider>
                </div>
            ) : (
                <button onClick={initUserWallet} className="mt-5 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-700">
                    Connect to Ethereum Wallet
                </button>
            )}
        </main>
    );
}
