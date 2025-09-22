import { useEffect, useState } from 'react';

const ScanHistory = () => {
  const [scanHistory, setScanHistory] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('plantScanHistory');
      if (saved) setScanHistory(JSON.parse(saved));
    } catch (_) {}
  }, []);

  return (
    <div className="min-h-screen plant-scanner">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Scan History</h1>

        {scanHistory.length === 0 ? (
          <div className="text-center py-16 bg-white/70 rounded-xl">
            <p className="text-gray-600">No scan history yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {scanHistory.map((scan) => (
              <div key={scan.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 items-center">
                <img
                  src={scan.image}
                  alt={scan.plantName}
                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{scan.plantName}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(scan.timestamp).toLocaleDateString()} at {new Date(scan.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <a
                  href={scan.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanHistory;


