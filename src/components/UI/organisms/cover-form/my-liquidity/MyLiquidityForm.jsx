import { useRouter } from "next/router";
import { useState } from "react";

import { OutlinedButton } from "@/components/UI/atoms/button/outlined";
import { TokenAmountInput } from "@/components/UI/organisms/token-amount-input";
import { RegularButton } from "@/components/UI/atoms/button/regular";
import { ReceiveAmountInput } from "@/components/UI/organisms/receive-amount-input";
import { UnlockDate } from "@/components/UI/organisms/unlock-date";
import { convertFromUnits } from "@/utils/bn";
import { useProvideLiquidity } from "@/src/hooks/provide-liquidity/useProvideLiquidity";

export const MyLiquidityForm = ({
  coverKey,
  assuranceTokenAddress,
  assuranceTokenSymbol,
}) => {
  const [value, setValue] = useState();
  const router = useRouter();

  const {
    balance,
    approving,
    canProvideLiquidity,
    calculatePods,
    handleApprove,
    handleProvide,
    isError,
    providing,
    receiveAmount,
  } = useProvideLiquidity({
    coverKey,
    liquidityTokenAddress: assuranceTokenAddress, // DAI
    value,
  });

  const handleChooseMax = () => {
    if (!balance) {
      return;
    }
    setValue(convertFromUnits(balance).toString());
  };

  const handleChange = (val) => {
    setValue(val);
    calculatePods(val);
  };

  return (
    <div className="max-w-md">
      <div className="pb-16">
        <TokenAmountInput
          labelText={"Enter Amount you wish to provide"}
          onChange={handleChange}
          handleChooseMax={handleChooseMax}
          error={isError}
          tokenAddress={assuranceTokenAddress}
          tokenSymbol={assuranceTokenSymbol}
          tokenBalance={balance}
          inputId={"cover-amount"}
          inputValue={value}
        />
      </div>

      <div className="pb-16">
        <ReceiveAmountInput
          labelText="You Will Receive"
          tokenSymbol="POD"
          inputValue={receiveAmount}
          inputId="my-liquidity-receive"
        />
      </div>

      <div>
        <UnlockDate dateValue="September 22, 2021 12:34:00 PM UTC" />
      </div>

      {!canProvideLiquidity ? (
        <RegularButton
          disabled={isError || approving}
          className="w-full mt-8 p-6 text-h6 uppercase font-semibold"
          onClick={handleApprove}
        >
          {approving ? "Approving..." : "Approve DAI"}
        </RegularButton>
      ) : (
        <RegularButton
          disabled={isError || providing}
          className="w-full mt-8 p-6 text-h6 uppercase font-semibold"
          onClick={handleProvide}
        >
          {providing ? "Adding Liquidity..." : "Add Liquidity"}
        </RegularButton>
      )}

      <div className="mt-16">
        <OutlinedButton className="rounded-big" onClick={() => router.back()}>
          &#x27F5;&nbsp;Back
        </OutlinedButton>
      </div>
    </div>
  );
};
