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

    const { data: tree, error: treeError } = await supabase.from('trees').select('*').eq('code', token.trim().toUpperCase()).single();

    if (treeError || !tree) {
      setErrorMsg('Pohon tidak ditemukan. Cek kembali Token ID Anda.');
      setLoading(false);
      return;
    }
    setTreeData(tree);

    const { data: history, error: historyError } = await supabase.from('tree_checkpoints').select('*').eq('tree_code', token.trim().toUpperCase()).order('checkpoint_date', { ascending: false });

    if (!historyError && history) setCheckpoints(history);
    setLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="search-form">
        <input type="text" placeholder="Masukkan Token ID (Cth: NT-2024-001)" className="input-text" value={token} onChange={(e) => setToken(e.target.value)} />
        <button type="submit" disabled={loading} className="btn">
          {loading ? 'Mencari...' : 'Lacak Pohon'}
        </button>
      </form>

      {errorMsg && <p style={{ color: 'red', textAlign: 'center', marginBottom: '20px' }}>{errorMsg}</p>}

      {treeData && (
        <div>
          <div className="info-grid">
            <div className="info-item"><label>Nama Pohon</label><p>{treeData.name}</p></div>
            <div className="info-item"><label>Spesies</label><p style={{fontStyle: 'italic'}}>{treeData.species}</p></div>
            <div className="info-item"><label>Lokasi</label><p>{treeData.location}</p></div>
            <div className="info-item"><label>Status</label><p style={{textTransform: 'capitalize'}}>{treeData.status}</p></div>
          </div>

          <h3 style={{fontSize: '1.5rem', marginBottom: '20px'}}>Riwayat Pertumbuhan</h3>
          
          {checkpoints.length === 0 ? (
            <p className="subtitle">Belum ada catatan progres untuk pohon ini.</p>
          ) : (
            <div className="timeline">
              {checkpoints.map((cp) => (
                <div key={cp.id} className="timeline-item">
                  <span className="timeline-date">{new Date(cp.checkpoint_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <h4 className="timeline-title">{cp.title}</h4>
                  <p className="timeline-desc">{cp.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}