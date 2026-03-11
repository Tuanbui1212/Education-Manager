interface TableSkeletonProps {
    columns: number;
    rows?: number;
}

const TableSkeleton = ({ columns, rows = 5 }: TableSkeletonProps) => {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="animate-pulse border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <td key={colIndex} className="p-4">
                            <div
                                className={`h-4 bg-gray-200 rounded-lg ${colIndex === 0 ? 'w-8 mx-auto' :
                                    colIndex === columns - 1 ? 'w-24 mx-auto' :
                                        colIndex % 2 === 0 ? 'w-3/4' : 'w-full'
                                    }`}
                            ></div>
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
};

export default TableSkeleton;
