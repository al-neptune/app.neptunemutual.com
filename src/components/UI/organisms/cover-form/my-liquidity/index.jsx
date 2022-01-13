import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { liquidity } from "@neptunemutual/sdk";

import { getERC20Balance } from "@/utils/blockchain/getERC20Balance";
import { getProviderOrSigner } from "@/lib/connect-wallet/utils/web3";
import { useConstants } from "@/components/pages/cover/useConstants";
import { OutlinedButton } from "@/components/UI/atoms/button/outlined";
import { TokenAmountInput } from "@/components/UI/organisms/token-amount-input";
import { RegularButton } from "@/components/UI/atoms/button/regular";
import { ReceiveAmountInput } from "@/components/UI/organisms/receive-amount-input";
import { UnlockDate } from "@/components/UI/organisms/unlock-date";
import {
  convertToUnits,
  convertFromUnits,
  isGreater,
  isValidNumber,
} from "@/utils/bn";

export const CoverFormMyLiquidity = ({
  coverKey,
  assuranceTokenAddress,
  assuranceTokenSymbol,
}) => {
  const router = useRouter();
  const { fees, maxValue } = useConstants();
  const { library, account, chainId } = useWeb3React();

  const [value, setValue] = useState();
  const [receiveAmount, setReceiveAmount] = useState();
  const [balance, setBalance] = useState();
  const [allowance, setAllowance] = useState();
  const [approving, setApproving] = useState();
  const [addLiquidity, setAddLiquidity] = useState();

  useEffect(() => {
    if (!chainId || !account) return;

    let ignore = false;
    getERC20Balance(assuranceTokenAddress, library, account, chainId)
      .then((bal) => {
        if (ignore) return;
        setBalance(bal);
      })
      .catch((e) => {
        console.error(e);
        if (ignore) return;
      });

    return () => (ignore = true);
  }, [account, chainId, library, assuranceTokenAddress]);

  useEffect(() => {
    if (!chainId || !account) return;

    let ignore = false;

    const signerOrProvider = getProviderOrSigner(library, account, chainId);

    liquidity
      .getAllowance(chainId, coverKey, account, signerOrProvider)
      .then(({ result }) => {
        if (ignore) return;
        setAllowance(result);
      })
      .catch((e) => {
        console.error(e);
        if (ignore) return;
      });

    return () => (ignore = true);
  }, [account, chainId, library, assuranceTokenAddress, coverKey]);

  const handleChooseMax = () => {
    if (!balance) {
      return;
    }
    setValue(convertFromUnits(balance).toString());
  };

  const handleChange = (val) => {
    if (typeof val === "string") {
      const willRecieve = parseFloat(0.99 * val).toFixed(2);
      setValue(val);
      setReceiveAmount(willRecieve);
    }
  };

  const checkAllowance = async () => {
    try {
      const { result: _allowance } = await liquidity.getAllowance(
        chainId,
        coverKey,
        account,
        signerOrProvider
      );

      setAllowance(_allowance);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprove = async () => {
    try {
      setApproving(true);
      const signerOrProvider = getProviderOrSigner(library, account, chainId);

      let tx = await liquidity.approve(
        chainId,
        coverKey,
        { amount: convertToUnits(value).toString() },
        signerOrProvider
      );

      await tx.result.wait();

      setApproving(false);
      checkAllowance();
    } catch (error) {
      setApproving(false);
    }
  };

  const handleAdd = async () => {
    try {
      setAddLiquidity(true);

      const signerOrProvider = getProviderOrSigner(library, account, chainId);
      const amount = convertToUnits(value).toString();

      const tx = await liquidity.add(
        chainId,
        coverKey,
        amount,
        signerOrProvider
      );
      await tx.result.wait();

      setAddLiquidity(false);
    } catch (error) {
      setAddLiquidity(false);
    }
  };

  if (!fees && !maxValue) {
    return <>loading...</>;
  }

  const canAddLiquidity =
    value &&
    isValidNumber(value) &&
    isGreater(allowance || "0", convertToUnits(value || "0"));
  const isError =
    value &&
    (!isValidNumber(value) ||
      isGreater(convertToUnits(value || "0"), balance || "0"));

  return (
    <div className="max-w-md">
      <div className="pb-16">
        <TokenAmountInput
          labelText={"Enter Amount you wish to provide"}
          onInput={handleChange}
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

      {!canAddLiquidity ? (
        <RegularButton
          disabled={isError || approving}
          className="w-full mt-8 p-6 text-h6 uppercase font-semibold"
          onClick={handleApprove}
        >
          {approving ? "Approving..." : "Approve DAI"}
        </RegularButton>
      ) : (
        <RegularButton
          disabled={isError || addLiquidity}
          className="w-full mt-8 p-6 text-h6 uppercase font-semibold"
          onClick={handleAdd}
        >
          {addLiquidity ? "Adding Liquidity..." : "Add Liquidity"}
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
