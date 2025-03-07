import { useState, useEffect } from "react";
import { getNetworkId } from "@/src/config/environment";
import { useSubgraphFetch } from "@/src/hooks/useSubgraphFetch";

const getQuery = (coverKey, productKey) => {
  return `
  {
    incidentReports(where: {
      coverKey: "${coverKey}"
      productKey: "${productKey}"
      finalized: false
    }) {
      id
      reporterInfo
      coverKey
      productKey
      incidentDate
    }
  }
  `;
};

/**
 *
 * @param {object} param
 * @param {string} param.coverKey
 * @param {string} param.productKey
 * @returns
 */
export const useFetchCoverProductActiveReportings = ({
  coverKey,
  productKey,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchCoverProductActiveReportings = useSubgraphFetch(
    "useFetchCoverProductActiveReportings"
  );

  useEffect(() => {
    if (productKey && coverKey) {
      setLoading(true);
      fetchCoverProductActiveReportings(
        getNetworkId(),
        getQuery(coverKey, productKey)
      )
        .then(({ incidentReports }) => {
          setData(incidentReports);
        })
        .catch((e) => console.error(`Error: ${e.message}`))
        .finally(() => setLoading(false));
    }
  }, [coverKey, fetchCoverProductActiveReportings, productKey]);

  return {
    data,
    loading,
  };
};
