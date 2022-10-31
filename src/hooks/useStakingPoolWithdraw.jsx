import { useState } from 'react'
import { t } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { getProviderOrSigner } from '@/lib/connect-wallet/utils/web3'
import { registry } from '@neptunemutual/sdk'
import { convertToUnits } from '@/utils/bn'
import { useTxToast } from '@/src/hooks/useTxToast'
import { useErrorNotifier } from '@/src/hooks/useErrorNotifier'
import { useTxPoster } from '@/src/context/TxPoster'
import { useNetwork } from '@/src/context/Network'
import {
  STATUS,
  TransactionHistory
} from '@/src/services/transactions/transaction-history'
import { METHODS } from '@/src/services/transactions/const'
import { getActionMessage } from '@/src/helpers/notification'
import { logStakingPoolWithdraw, logStakingPoolWithdrawRewards } from '@/src/services/logs'
import { analyticsLogger } from '@/utils/logger'

export const useStakingPoolWithdraw = ({
  value,
  poolKey,
  tokenSymbol,
  refetchInfo
}) => {
  const [withdrawing, setWithdrawing] = useState(false)

  const { networkId } = useNetwork()
  const { account, library } = useWeb3React()

  const txToast = useTxToast()
  const { writeContract } = useTxPoster()
  const { notifyError } = useErrorNotifier()

  const handleWithdraw = async (onTxSuccess) => {
    if (!account || !networkId) {
      return
    }

    setWithdrawing(true)

    const cleanup = () => {
      refetchInfo()
      setWithdrawing(false)
    }
    const handleError = (err) => {
      notifyError(err, t`Could not unstake ${tokenSymbol}`)
    }

    try {
      const signerOrProvider = getProviderOrSigner(library, account, networkId)

      const instance = await registry.StakingPools.getInstance(
        networkId,
        signerOrProvider
      )

      const onTransactionResult = async (tx) => {
        TransactionHistory.push({
          hash: tx.hash,
          methodName: METHODS.UNSTAKING_DEPOSIT,
          status: STATUS.PENDING,
          data: {
            value,
            tokenSymbol
          }
        })

        await txToast.push(
          tx,
          {
            pending: getActionMessage(
              METHODS.UNSTAKING_DEPOSIT,
              STATUS.PENDING,
              {
                value,
                tokenSymbol
              }
            ).title,
            success: getActionMessage(
              METHODS.UNSTAKING_DEPOSIT,
              STATUS.SUCCESS,
              {
                value,
                tokenSymbol
              }
            ).title,
            failure: getActionMessage(
              METHODS.UNSTAKING_DEPOSIT,
              STATUS.FAILED,
              {
                value,
                tokenSymbol
              }
            ).title
          },
          {
            onTxSuccess: () => {
              TransactionHistory.push({
                hash: tx.hash,
                methodName: METHODS.UNSTAKING_DEPOSIT,
                status: STATUS.SUCCESS,
                data: {
                  value,
                  tokenSymbol
                }
              })
              analyticsLogger(() => logStakingPoolWithdraw(networkId, account, poolKey, value, tokenSymbol, tx.hash))
              onTxSuccess()
            },
            onTxFailure: () => {
              TransactionHistory.push({
                hash: tx.hash,
                methodName: METHODS.UNSTAKING_DEPOSIT,
                status: STATUS.FAILED,
                data: {
                  value,
                  tokenSymbol
                }
              })
            }
          }
        )

        cleanup()
      }

      const onRetryCancel = () => {
        cleanup()
      }

      const onError = (err) => {
        handleError(err)
        cleanup()
      }

      const args = [poolKey, convertToUnits(value).toString()]
      writeContract({
        instance,
        methodName: 'withdraw',
        onTransactionResult,
        onRetryCancel,
        onError,
        args
      })
    } catch (err) {
      handleError(err)
      cleanup()
    }
  }

  return {
    withdrawing,
    handleWithdraw
  }
}

export const useStakingPoolWithdrawRewards = ({ poolKey, refetchInfo, rewardTokenSymbol, rewardAmount }) => {
  const [withdrawingRewards, setWithdrawingRewards] = useState(false)

  const { networkId } = useNetwork()
  const { account, library } = useWeb3React()

  const txToast = useTxToast()
  const { writeContract } = useTxPoster()
  const { notifyError } = useErrorNotifier()

  const handleWithdrawRewards = async (onTxSuccess) => {
    if (!account || !networkId) {
      return
    }

    setWithdrawingRewards(true)

    const cleanup = () => {
      refetchInfo()
      setWithdrawingRewards(false)
    }
    const handleError = (err) => {
      notifyError(err, t`Could not withdraw rewards`)
    }

    try {
      const signerOrProvider = getProviderOrSigner(library, account, networkId)

      const instance = await registry.StakingPools.getInstance(
        networkId,
        signerOrProvider
      )

      const onTransactionResult = async (tx) => {
        TransactionHistory.push({
          hash: tx.hash,
          methodName: METHODS.UNSTAKING_WITHDRAW,
          status: STATUS.PENDING,
          data: {
            value: rewardAmount,
            tokenSymbol: rewardTokenSymbol
          }
        })

        await txToast.push(
          tx,
          {
            pending: getActionMessage(
              METHODS.UNSTAKING_WITHDRAW,
              STATUS.PENDING, {
                value: rewardAmount,
                tokenSymbol: rewardTokenSymbol
              }
            ).title,
            success: getActionMessage(
              METHODS.UNSTAKING_WITHDRAW,
              STATUS.SUCCESS, {
                value: rewardAmount,
                tokenSymbol: rewardTokenSymbol
              }
            ).title,
            failure: getActionMessage(METHODS.UNSTAKING_WITHDRAW, STATUS.FAILED, {
              value: rewardAmount,
              tokenSymbol: rewardTokenSymbol
            })
              .title
          },
          {
            onTxSuccess: () => {
              TransactionHistory.push({
                hash: tx.hash,
                methodName: METHODS.UNSTAKING_WITHDRAW,
                status: STATUS.SUCCESS,
                data: {
                  value: rewardAmount,
                  tokenSymbol: rewardTokenSymbol
                }
              })
              analyticsLogger(() => logStakingPoolWithdrawRewards(networkId, account, poolKey, tx.hash))
              onTxSuccess()
            },
            onTxFailure: () => {
              TransactionHistory.push({
                hash: tx.hash,
                methodName: METHODS.UNSTAKING_WITHDRAW,
                status: STATUS.FAILED,
                data: {
                  value: rewardAmount,
                  tokenSymbol: rewardTokenSymbol
                }
              })
            }
          }
        )

        cleanup()
      }

      const onRetryCancel = () => {
        cleanup()
      }

      const onError = (err) => {
        handleError(err)
        cleanup()
      }

      const args = [poolKey]
      writeContract({
        instance,
        methodName: 'withdrawRewards',
        onTransactionResult,
        onRetryCancel,
        onError,
        args
      })
    } catch (err) {
      handleError(err)
      cleanup()
    }
  }

  return {
    withdrawingRewards,
    handleWithdrawRewards
  }
}
