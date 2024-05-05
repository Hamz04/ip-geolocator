import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'), iconUrl: require('leaflet/dist/images/marker-icon.png'), shadowUrl: require('leaflet/dist/images/marker-shadow.png') });

export default function App() {
  const [ip, setIp] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async () => {
    if (!ip) return;
    setLoading(true); setError(''); setData(null);
    try {
      const r = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
      if (r.data.status === 'fail') throw new Error(r.data.message);
      setData(r.data);
    } catch(e) { setError(e.message || 'Lookup failed'); }
    setLoading(false);
  };

  const InfoRow = ({label, value}) => (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #1e293b' }}>
      <span style={{ color:'#94a3b8', fontSize:13 }}>{label}</span>
      <span style={{ color:'white', fontSize:13, fontWeight:600 }}>{value}</span>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#0f172a', fontFamily:'sans-serif', padding:'32px 24px' }}>
      <h1 style={{ color:'#38bdf8', textAlign:'center', marginBottom:32 }}>🗺️ IP Geolocator</h1>
      <div style={{ display:'flex', gap:8, maxWidth:440, margin:'0 auto 32px' }}>
        <input value={ip} onChange={e=>setIp(e.target.value)} onKeyDown={e=>e.key==='Enter'&&lookup()}
          placeholder="Enter IP address..." style={{ flex:1, padding:'12px 16px', borderRadius:8, border:'1px solid #334155', background:'#1e293b', color:'white', fontSize:16 }}/>
        <button onClick={lookup} style={{ padding:'12px 24px', borderRadius:8, background:'#0ea5e9', color:'white', border:'none', cursor:'pointer', fontSize:16 }}>
          {loading ? '...' : 'Locate'}
        </button>
      </div>
      {error && <p style={{ color:'#f85149', textAlign:'center' }}>{error}</p>}
      {data && (
        <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
          <div style={{ background:'#1e293b', borderRadius:16, padding:24 }}>
            <h3 style={{ color:'#38bdf8', marginTop:0 }}>Location Details</h3>
            <InfoRow label="IP" value={data.query}/>
            <InfoRow label="Country" value={data.country}/>
            <InfoRow label="Region" value={data.regionName}/>
            <InfoRow label="City" value={data.city}/>
            <InfoRow label="Timezone" value={data.timezone}/>
            <InfoRow label="ISP" value={data.isp}/>
            <InfoRow label="Coordinates" value={`${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`}/>
          </div>
          <div style={{ borderRadius:16, overflow:'hidden', height:360 }}>
            <MapContainer center={[data.lat, data.lon]} zoom={10} style={{ height:'100%', width:'100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
              <Marker position={[data.lat, data.lon]}>
                <Popup>{data.city}, {data.country}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}
