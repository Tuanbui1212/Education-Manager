export const ClassCardSkeleton = () => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
        <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl" />
            <div className="w-24 h-6 bg-gray-200 rounded-full" />
        </div>
        <div className="h-5 bg-gray-200 rounded mb-4 w-3/4" />
        <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
        </div>
    </div>
);
