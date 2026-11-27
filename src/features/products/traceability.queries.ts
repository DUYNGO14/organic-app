import { useQuery } from "@tanstack/react-query";

type TraceabilityBatch = {
  code: string;
  productId: string;
  productName: string;
  farmName: string;
  growingRegion: string;
  harvestedAt: string;
};

const demoBatches: readonly TraceabilityBatch[] = [
  {
    code: "KL-2408",
    productId: "kale",
    productName: "Cải Kale Thủy Canh",
    farmName: "Hợp tác xã Nông sản Xanh Lạc Dương",
    growingRegion: "Lạc Dương, Lâm Đồng",
    harvestedAt: "2026-08-24T05:14:00+07:00",
  },
  {
    code: "KL-2508",
    productId: "kale",
    productName: "Cải Kale Thủy Canh",
    farmName: "Hợp tác xã Nông sản Xanh Lạc Dương",
    growingRegion: "Lạc Dương, Lâm Đồng",
    harvestedAt: "2026-08-25T06:10:00+07:00",
  },
];

function getTraceabilityBatch(batchCode: string) {
  return Promise.resolve(demoBatches.find(({ code }) => code === batchCode) ?? null);
}

export function useTraceabilityBatch(batchCode: string) {
  return useQuery({
    queryKey: ["traceability-batch", batchCode],
    queryFn: () => getTraceabilityBatch(batchCode),
    networkMode: "always",
  });
}
