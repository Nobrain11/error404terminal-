import { useState } from 'react';

export default function ScannerPage() {
  const [ca, setCa] = useState('');
  const [result, setResult] = useState<any>(null);

  const scan = async () => {
    // Placeholder scan — always returns "Unknown"
    setResult({
      holderConcentration: 'Unknown',
      verified: 'Unknown',
      lpStatus: 'Unknown',
      riskScore: 'Not available',
    });
  };

  return (
    <div style={{ padding: 12 }}>
      <h2 style={{ color: '#00C805', fontSize: 18, marginBottom: 12 }}>Contract Scanner</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Paste contract address"
          value={ca}
          onChange={(e) => setCa(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: '#111',
            border: '1px solid #2a2a2a',
            borderRadius: 8,
            color: '#e5e5e5',
            fontSize: 14,
            outline: 'none',
          }}
        />
        <button
          onClick={scan}
          style={{ background: '#00C805', border: 'none', color: '#0a0a0b', padding: '8px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
        >
          Scan
        </button>
      </div>
      {result && (
        <div style={{ marginTop: 16, background: '#111', borderRadius: 8, padding: 16 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <div><span style={{ color: '#888' }}>Holder Concentration:</span> {result.holderConcentration}</div>
            <div><span style={{ color: '#888' }}>Verified:</span> {result.verified}</div>
            <div><span style={{ color: '#888' }}>LP Status:</span> {result.lpStatus}</div>
            <div><span style={{ color: '#888' }}>Risk Score:</span> {result.riskScore}</div>
          </div>
        </div>
      )}
    </div>
  );
}
