import React, { useState } from "react";

import {
  Table,
  TBody,
  TableWrapper,
  THead,
  TableShowMore,
} from "@/common/Table/Table";
import { classNames } from "@/utils/classnames";
import { ClaimCoverModal } from "@/src/modules/my-policies/ClaimCoverModal";
import { fromNow } from "@/utils/formatter/relative-time";
import DateLib from "@/lib/date/DateLib";
import { formatCurrency } from "@/utils/formatter/currency";
import { convertFromUnits } from "@/utils/bn";
import {
  CxTokenRowProvider,
  useCxTokenRowContext,
} from "@/src/modules/my-policies/CxTokenRowContext";
import { useRouter } from "next/router";
import { useTokenDecimals } from "@/src/hooks/useTokenDecimals";

const renderHeader = (col) => (
  <th
    scope="col"
    className={classNames(
      `px-6 py-6 font-bold text-sm uppercase`,
      col.align === "right" ? "text-right" : "text-left"
    )}
  >
    {col.name}
  </th>
);

const renderAddress = (row) => (
  <td className="px-6 py-6 text-404040">{row.cxToken.id}</td>
);

const renderClaimBefore = (row) => <ClaimBeforeColumnRenderer row={row} />;

const renderAmount = (row) => <CxTokenAmountRenderer row={row} />;

const renderActions = (row, extraData) => {
  return <ClaimActionsColumnRenderer row={row} extraData={extraData} />;
};

export const columns = [
  {
    name: "cxToken Address",
    align: "left",
    renderHeader,
    renderData: renderAddress,
  },
  {
    name: "Claim before",
    align: "left",
    renderHeader,
    renderData: renderClaimBefore,
  },
  {
    name: "Amount",
    align: "right",
    renderHeader,
    renderData: renderAmount,
  },
  {
    name: "",
    align: "right",
    renderHeader,
    renderData: renderActions,
  },
];

const ClaimTableContext = React.createContext({ report: null });
function useClaimTableContext() {
  const context = React.useContext(ClaimTableContext);
  if (context === undefined) {
    throw new Error(
      "useClaimTableContext must be used within a ClaimTableContext.Provider"
    );
  }
  return context;
}

export const ClaimCxTokensTable = ({
  activePolicies,
  coverKey,
  incidentDate,
  report,
  setPage,
  hasMore = false,
  loading = false,
}) => {
  return (
    <>
      <ClaimTableContext.Provider value={{ report }}>
        <TableWrapper data-testid="table-wrapper">
          <Table>
            <THead columns={columns} data-testid="table-header"></THead>
            <TBody
              columns={columns}
              data={activePolicies}
              extraData={{ coverKey, incidentDate }}
              RowWrapper={CxTokenRowProvider}
              isLoading={loading}
            ></TBody>
          </Table>
          {hasMore && (
            <TableShowMore
              isLoading={loading}
              onShowMore={() => {
                setPage((prev) => prev + 1);
              }}
            />
          )}
        </TableWrapper>
      </ClaimTableContext.Provider>
    </>
  );
};

const CxTokenAmountRenderer = () => {
  const { balance, tokenSymbol, tokenAddress } = useCxTokenRowContext();
  const router = useRouter();
  const tokenDecimals = useTokenDecimals(tokenAddress);

  return (
    <>
      <td className="px-6 py-6 text-right">
        <span
          title={
            formatCurrency(
              convertFromUnits(balance, tokenDecimals),
              router.locale,
              tokenSymbol,
              true
            ).long
          }
        >
          {
            formatCurrency(
              convertFromUnits(balance, tokenDecimals),
              router.locale,
              tokenSymbol,
              true
            ).short
          }
        </span>
      </td>
    </>
  );
};

export const ClaimBeforeColumnRenderer = () => {
  const { report } = useClaimTableContext();
  const claimExpiryDate = report?.claimExpiresAt || 0;
  const router = useRouter();

  return (
    <td className="px-6 py-6">
      <span
        className="text-left whitespace-nowrap"
        title={DateLib.toLongDateFormat(claimExpiryDate, router.locale)}
      >
        {fromNow(claimExpiryDate)}
      </span>
    </td>
  );
};

export const ClaimActionsColumnRenderer = ({ row, extraData }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => {
    setIsOpen(false);
  };

  const onOpen = () => {
    setIsOpen(true);
  };

  return (
    <td className="px-6 py-6 text-right min-w-120">
      <button
        className="cursor-pointer text-4e7dd9 hover:underline"
        onClick={onOpen}
      >
        Claim
      </button>

      <ClaimCoverModal
        data={row}
        coverKey={row.cover.id}
        cxTokenAddress={row.cxToken.id}
        isOpen={isOpen}
        onClose={onClose}
        modalTitle="Claim Cover"
        incidentDate={extraData.incidentDate}
      />
    </td>
  );
};
