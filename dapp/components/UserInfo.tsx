import React, {useContext} from "react";
import HomeContext, {IState, HomeContextType} from '@/components/HomeContext';

export default function UserInfo(): JSX.Element {
    const {state, dispatch}: HomeContextType = useContext(HomeContext);

    const handleMintRemainingTokens = async () => {
        try {
            const remainingTokens = state.mintLimit - state.mintedToday;
            if (remainingTokens > 0) {
                try {
                    const result = await state.contract.methods.mint([state.account], [remainingTokens]).send({from: state.account});
                    console.log("Mint result", result);
                    console.log(`Successfully minted ${remainingTokens} BT tokens`);
                } catch (error) {
                    console.error("Failed to mint tokens:", error);
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to mint tokens:", error);
        }
    };

    return (
        <div className="info-container">
            <p className="info-text"><strong>Connected with:</strong> {state.account}</p>
            <p className="info-text"><strong>Balance ETH:</strong> {Number.parseFloat(state.balanceETH).toFixed(10)} ETH</p>
            <p className="info-text"><strong>Balance BT:</strong> {Number.parseFloat(state.balanceBT).toFixed(10)} BT</p>
            <p className="info-text"><strong>Minted Today:</strong> {state.mintedToday} tokens</p>
            <p className="info-text"><strong>Mint Limit / Day:</strong> {state.mintLimit} tokens</p>
            <p className="info-text"><strong>Transfer Limit / Day:</strong> {state.transferLimit} tokens</p>
            <p className="info-text"><strong>Roles:</strong> {state.userRoles.length > 0 ? state.userRoles.join(', ') : 'No roles found'}</p>
            {/*{state.mintedToday < state.mintLimit && (*/}
            {/*    <button onClick={handleMintRemainingTokens} className="button">*/}
            {/*        Mint Remaining Tokens*/}
            {/*    </button>*/}
            {/*)}*/}
        </div>
    );
}
