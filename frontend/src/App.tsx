import { FormEvent, useMemo, useState } from 'react';

type CheckResult = {
  ok: boolean;
  httpStatus: number;
  bodyText: string;
  checkedAt: string;
  latencyMs: number;
};

export default function App() {
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000');
  const [path, setPath] = useState('/health');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);

  const endpoint = useMemo(() => {
    const trimmedBase = backendUrl.trim().replace(/\/+$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${trimmedBase}${normalizedPath}`;
  }, [backendUrl, path]);

  const runCheck = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const startedAt = performance.now();

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json, text/plain, */*' }
      });

      const bodyText = await response.text();

      setResult({
        ok: response.ok,
        httpStatus: response.status,
        bodyText,
        checkedAt: new Date().toLocaleString(),
        latencyMs: Math.round(performance.now() - startedAt)
      });
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : 'Unknown network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="status-card">
        <h1>Backend Test Page</h1>
        <p>Use this page to confirm your backend is reachable and responding.</p>

        <form onSubmit={runCheck} className="tester-form">
          <label>
            Backend URL
            <input
              type="text"
              value={backendUrl}
              onChange={(event) => setBackendUrl(event.target.value)}
              placeholder="http://localhost:8000"
              required
            />
          </label>

          <label>
            Endpoint Path
            <input
              type="text"
              value={path}
              onChange={(event) => setPath(event.target.value)}
              placeholder="/health"
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Checking...' : 'Check Backend'}
          </button>
        </form>

        <div className="endpoint">Request: {endpoint}</div>

        {error ? <div className="error">Connection failed: {error}</div> : null}

        {result ? (
          <div className={result.ok ? 'result success' : 'result failure'}>
            <h2>{result.ok ? 'Backend is working' : 'Backend responded with an error'}</h2>
            <p>HTTP Status: {result.httpStatus}</p>
            <p>Response time: {result.latencyMs} ms</p>
            <p>Checked at: {result.checkedAt}</p>
            <pre>{result.bodyText || '(empty response)'}</pre>
          </div>
        ) : null}
      </section>
    </main>
  );
}
