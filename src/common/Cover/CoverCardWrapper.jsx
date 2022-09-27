import Link from 'next/link'
import { utils } from '@neptunemutual/sdk'
import { Routes } from '@/src/config/routes'
import { useCoverOrProductData } from '@/src/hooks/useCoverOrProductData'
import { CoverCard } from '@/common/Cover/CoverCard'
import { CardSkeleton } from '@/common/Skeleton/CardSkeleton'

export const CoverCardWrapper = ({
  coverKey,
  progressFgColor = undefined,
  progressBgColor = undefined
}) => {
  const productKey = utils.keyUtil.toBytes32('')
  const coverInfo = useCoverOrProductData({ coverKey, productKey })

  if (!coverInfo) {
    return <CardSkeleton numberOfCards={1} />
  }

  return (
    <Link href={Routes.ViewCover(coverKey)} key={coverKey}>
      <a
        className='rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-4e7dd9'
        data-testid='cover-link'
      >
        <CoverCard
          coverKey={coverKey}
          coverInfo={coverInfo}
          progressFgColor={progressFgColor}
          progressBgColor={progressBgColor}
        />
      </a>
    </Link>
  )
}
