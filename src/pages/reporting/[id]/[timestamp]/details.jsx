import Head from "next/head";
import { useRouter } from "next/router";
import { useFetchReport } from "@/src/hooks/useFetchReport";
import { ReportingDetailsPage } from "@/components/pages/reporting/details";
import { toBytes32 } from "@/src/helpers/cover";

export default function IncidentResolvedCoverPage() {
  const router = useRouter();
  const { id: cover_id, timestamp } = router.query;

  const coverKey = toBytes32(cover_id);
  const { data, loading, refetch } = useFetchReport({
    coverKey: coverKey,
    incidentDate: timestamp,
  });

  return (
    <main>
      <Head>
        <title>Neptune Mutual Covers</title>
        <meta
          name="description"
          content="Get guaranteed payouts from our parametric cover model. Resolve incidents faster without the need for claims assessment."
        />
      </Head>

      {loading && <p className="text-center">Loading...</p>}

      {!data.incidentReport && <p className="text-center">No data found</p>}

      {data.incidentReport && (
        <ReportingDetailsPage
          incidentReport={data.incidentReport}
          refetchReport={refetch}
        />
      )}
    </main>
  );
}
