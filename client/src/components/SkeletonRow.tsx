// ─── Skeleton Row ─────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr className="border-b border-gray-50">
    <td className="px-5 py-4">
      <div className="h-4 w-5 bg-gray-100 rounded mx-auto animate-pulse" />
    </td>
    <td className="px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0 animate-pulse" />
        <div className="space-y-2">
          <div className="h-3.5 bg-gray-100 rounded-full w-28 animate-pulse" />
          <div className="h-3 bg-gray-50 rounded-full w-20 animate-pulse" />
        </div>
      </div>
    </td>
    <td className="px-5 py-4 space-y-2">
      <div className="h-3 bg-gray-100 rounded-full w-24 animate-pulse" />
      <div className="h-3 bg-gray-50 rounded-full w-36 animate-pulse" />
    </td>
    <td className="px-5 py-4">
      <div className="h-7 bg-gray-100 rounded-lg w-32 animate-pulse" />
    </td>
    <td className="px-5 py-4">
      <div className="h-6 bg-gray-100 rounded-full w-24 animate-pulse" />
    </td>
    <td className="px-5 py-4">
      <div className="flex justify-center gap-2">
        <div className="w-8 h-8 bg-gray-100 rounded-xl animate-pulse" />
        <div className="w-8 h-8 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    </td>
  </tr>
);

export default SkeletonRow;
