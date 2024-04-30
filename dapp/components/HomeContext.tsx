import {createContext} from "react";

export interface IState {
    web3: any | null;  // Consider using a more specific type if available
    balanceETH: string;
    balanceBT: string;
    account: string | null;
    receiverAddress: string;
    amount: string;
    delegateAddress: string;
    delegationAmount: string;
    userRoles: string[];
    mintedToday: number;
    mintLimit: number;
    transferLimit: number;
    contract: any | null;  // Consider using a specific contract interface if available
}

export interface HomeContextType {
    state: IState;
    dispatch: React.Dispatch<ActionType>;
}

const HomeContext = createContext<HomeContextType>();

export default HomeContext;
