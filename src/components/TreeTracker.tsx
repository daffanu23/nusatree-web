import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function TreeTracker() {
  const [token, setToken] = useState('');
  const [treeData, setTreeData] = useState<any>(null);
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setTreeData(null);
    setCheckpoints([]);

    // 1. Cari data utama pohon
    const { data: tree, error: treeError } = await supabase
      .from('trees')
      .select('*')
      .eq('code', token.trim().toUpperCase())
      .single();

    if (treeError || !tree) {
      setErrorMsg('Pohon tidak ditemukan. Cek kembali Token ID Anda.');
      setLoading(false);
      return;
    }
    setTreeData(tree);

    // 2. Cari riwayat pertumbuhannya (diurutkan dari yang terbaru)
    const { data: history, error: historyError } = await supabase
      .from('tree_checkpoints')
      .select('*')
      .eq('tree_code', token.trim().toUpperCase())
      .order('checkpoint_date', { ascending: false });

    if (!historyError && history) {
      setCheckpoints(history);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-sm border">
      <h2 className="text-2xl font-bold text-center text-green-800 mb-6">
        Lacak Pohon Anda
      </h2>
      
      {/* Form Pencarian */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          placeholder="Masukkan Token ID (Contoh: NT-2024-001)"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? 'Mencari...' : 'Lacak'}
        </button>
      </form>

      {/* Pesan Error */}
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-center">
          {errorMsg}
        </div>
      )}

      {/* Hasil Pencarian */}
      {treeData && (
        <div>
          {/* Info Utama Pohon */}
          <div className="bg-green-50 p-6 rounded-xl mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Nama Pohon</p>
                <p className="font-bold text-lg">{treeData.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Spesies</p>
                <p className="font-semibold italic">{treeData.species}</p>
              </div>
              <div>
                <p className="text-gray-500">Lokasi</p>
                <p className="font-semibold">{treeData.location}</p>
              </div>
              <div>
                <p className="text-gray-500">Status Terkini</p>
                <span className="inline-block bg-green-200 text-green-800 px-2 py-1 rounded capitalize font-medium">
                  {treeData.status}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Progress */}
          <h3 className="text-xl font-bold text-gray-800 mb-4">Riwayat Pertumbuhan</h3>
          
          {checkpoints.length === 0 ? (
            <p className="text-gray-500 italic">Belum ada catatan progres untuk pohon ini.</p>
          ) : (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-[8.5rem] md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-green-300 before:to-transparent">
              {checkpoints.map((cp, idx) => (
                <div key={cp.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Ikon Timeline */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-green-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    ✓
                  </div>
                  
                  {/* Kartu Timeline */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-gray-800">{cp.title}</h4>
                      <time className="text-xs font-medium text-green-600">
                        {new Date(cp.checkpoint_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </time>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{cp.description}</p>
                    <p className="text-xs text-gray-400 mt-2">Dilaporkan oleh: {cp.reported_by}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}