import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function EcoPackages() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPackages() {
      const { data, error } = await supabase.from('eco_packages').select('*').eq('is_active', true);
      if (!error && data) setPackages(data);
      setLoading(false);
    }
    fetchPackages();
  }, []);

  if (loading) return <p className="text-center">Memuat paket wisata...</p>;

  return (
    <div className="grid-cards">
      {packages.map((pkg) => (
        <div key={pkg.id} className="card">
          <span className="tag">{pkg.target_audience}</span>
          <h3 className="card-title">{pkg.title}</h3>
          <p className="card-desc">{pkg.description}</p>
          <div className="card-footer">
            <div className="price">Rp {pkg.price_per_pax.toLocaleString('id-ID')} <span>/ pax</span></div>
            <button className="btn">Pesan</button>
          </div>
        </div>
      ))}
    </div>
  );
}