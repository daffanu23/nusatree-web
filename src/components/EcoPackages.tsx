import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function EcoPackages() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPackages() {
      const { data, error } = await supabase
        .from('eco_packages')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching packages:', error);
      } else {
        setPackages(data || []);
      }
      setLoading(false);
    }

    fetchPackages();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Memuat paket wisata...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {packages.map((pkg) => (
        <div key={pkg.id} className="border rounded-xl p-5 shadow-sm hover:shadow-md transition">
          <h3 className="text-xl font-bold text-green-700">{pkg.title}</h3>
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-2">
            Target: {pkg.target_audience}
          </span>
          <p className="text-gray-600 mt-3 text-sm">{pkg.description}</p>
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <span className="font-bold text-lg">Rp {pkg.price_per_pax.toLocaleString('id-ID')} <span className="text-sm font-normal text-gray-500">/ pax</span></span>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
              Reservasi
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}