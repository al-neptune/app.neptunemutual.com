import Head from "next/head";
import { useRouter } from "next/router";
import { BreadCrumbs } from "@/common/BreadCrumbs/BreadCrumbs";
import { Container } from "@/common/Container/Container";
import { Hero } from "@/common/Hero";
import { HeroTitle } from "@/common/HeroTitle";
import { HeroStat } from "@/common/HeroStat";
import { ClaimCxTokensTable } from "@/src/modules/my-policies/ClaimCxTokensTable";
import { convertFromUnits } from "@/utils/bn";
import { useActivePoliciesByCover } from "@/src/hooks/useActivePoliciesByCover";
import { formatCurrency } from "@/utils/formatter/currency";
import { ComingSoon } from "@/common/ComingSoon";
import { useFetchReportsByKeyAndDate } from "@/src/hooks/useFetchReportsByKeyAndDate";
import { Alert } from "@/common/Alert/Alert";
import { t, Trans } from "@lingui/macro";
import { CoverStatsProvider } from "@/common/Cover/CoverStatsContext";
import { usePagination } from "@/src/hooks/usePagination";
import { safeFormatBytes32String } from "@/utils/formatter/bytes32String";
import { useAppConstants } from "@/src/context/AppConstants";
import { useCoverOrProductData } from "@/src/hooks/useCoverOrProductData";
import { isValidProduct } from "@/src/helpers/cover";

export const ClaimDetailsPage = ({ disabled }) => {
  const router = useRouter();
  const { page, limit, setPage } = usePagination();
  const { cover_id, product_id, timestamp } = router.query;
  const coverKey = safeFormatBytes32String(cover_id);
  const productKey = safeFormatBytes32String(product_id || "");

  const coverInfo = useCoverOrProductData({
    coverKey: coverKey,
    productKey: productKey,
  });
  const { data, hasMore } = useActivePoliciesByCover({
    coverKey,
    productKey,
    page,
    limit,
  });
  const { data: reports, loading: loadingReports } =
    useFetchReportsByKeyAndDate({
      coverKey,
      incidentDate: timestamp,
    });
  const { liquidityTokenDecimals } = useAppConstants();

  if (!coverInfo) {
    return <Trans>loading...</Trans>;
  }

  if (disabled) {
    return <ComingSoon />;
  }

  const isDiversified = isValidProduct(productKey);

  const title = !isDiversified
    ? coverInfo?.infoObj?.coverName
    : coverInfo?.infoObj?.productName;

  return (
    <CoverStatsProvider coverKey={coverKey} productKey={productKey}>
      <main>
        <Head>
          <title>Neptune Mutual Covers</title>
          <meta
            name="description"
            content="Get guaranteed payouts from our parametric cover model. Resolve incidents faster without the need for claims assessment."
          />
        </Head>

        <Hero>
          <Container className="px-2 py-20">
            <BreadCrumbs
              pages={[
                {
                  name: t`My Policies`,
                  href: "/my-policies/active",
                  current: false,
                },
                {
                  name: title,
                  href: !isDiversified
                    ? `/covers/${cover_id}/options`
                    : `/covers/${cover_id}/${product_id}/options`,
                  current: false,
                },
                { name: t`Claim`, href: "#", current: true },
              ]}
            />

            <div className="flex items-start">
              <HeroTitle>
                <Trans>My Policies</Trans>
              </HeroTitle>

              {/* My Active Protection */}
              <HeroStat title={t`My Active Protection`}>
                <>
                  {
                    formatCurrency(
                      convertFromUnits(
                        data.totalActiveProtection,
                        liquidityTokenDecimals
                      ),
                      router.locale,
                      "USD"
                    ).long
                  }
                </>
              </HeroStat>
            </div>
          </Container>

          <hr className="border-B0C4DB" />
        </Hero>

        <Container className="px-2 pt-12 pb-36">
          <h2 className="font-bold text-h2 font-sora">
            <Trans>Available cxTokens for {title} to Claim</Trans>
          </h2>
          <p className="w-full max-w-xl pt-6 pb-16 ml-0 text-lg">
            <Trans>
              Claim your {title} cover cxTokens from the following addresses
              before the given claim date. Also indicated is the amount of
              cxTokens you will receive per claim.
            </Trans>
          </p>

          {!loadingReports && reports.length === 0 && (
            <Alert className="mb-8 -mt-8">
              <Trans>
                No valid incidents are reported with the given timestamp
              </Trans>
            </Alert>
          )}

          <ClaimCxTokensTable
            activePolicies={data.activePolicies}
            coverKey={coverKey}
            incidentDate={timestamp}
            report={reports[0]}
            hasMore={hasMore}
            setPage={setPage}
            loading={hasMore}
          />
        </Container>
      </main>
    </CoverStatsProvider>
  );
};
