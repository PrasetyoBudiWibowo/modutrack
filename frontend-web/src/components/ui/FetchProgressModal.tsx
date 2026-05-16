interface FetchProgressProps {
  progress: {
    current: number;
    total: number;
    label: string;
  } | null;
}

export default function FetchProgressModal({ progress }: FetchProgressProps) {
  if (!progress) return null;

  const percentage =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-800">
              Mengambil Data Kecamatan
            </p>
            <p className="text-xs text-gray-500 mt-1 min-h-[16px]">
              {progress.label}
            </p>
          </div>
          {progress.total > 0 && (
            <div className="w-full">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>
                  {progress.current} / {progress.total}
                </span>
                <span>{percentage}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
