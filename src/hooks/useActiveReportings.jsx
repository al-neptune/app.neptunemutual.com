import { useState, useEffect, useCallback } from "react";
import { useNetwork } from "@/src/context/Network";
import { CARDS_PER_PAGE } from "@/src/config/constants";
import { useSubgraphFetch } from "@/src/hooks/useSubgraphFetch";

const getQuery = (itemsToSkip) => {
  return `
  {
    incidentReports(
      skip: ${itemsToSkip}
      first: ${CARDS_PER_PAGE}
      orderBy: incidentDate
      orderDirection: desc
      where:{
        finalized: false
      }
    ) {
      id
      coverKey
      productKey
      incidentDate
      resolutionDeadline
      resolved
      finalized
      status
      resolutionTimestamp
    }
  }
  `;
};

export const useActiveReportings = () => {
  const [data, setData] = useState({
    incidentReports: [],
  });
  const [loading, setLoading] = useState(false);
  const [itemsToSkip, setItemsToSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const { networkId } = useNetwork();
  const fetchActiveReportings = useSubgraphFetch("useActiveReportings");

  useEffect(() => {
    setLoading(true);

    fetchActiveReportings(networkId, getQuery(itemsToSkip))
      .then((_data) => {
        if (!_data) return;

        const isLastPage =
          _data.incidentReports.length === 0 ||
          _data.incidentReports.length < CARDS_PER_PAGE;

        if (isLastPage) {
          setHasMore(false);
        }

        setData((prev) => ({
          incidentReports: [...prev.incidentReports, ..._data.incidentReports],
        }));
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fetchActiveReportings, itemsToSkip, networkId]);

  const handleShowMore = useCallback(() => {
    setItemsToSkip((prev) => prev + CARDS_PER_PAGE);
  }, []);

  return {
    handleShowMore,
    hasMore,
    data: {
      incidentReports: data.incidentReports,
    },
    loading,
  };
};
