# DocuMind Frontend (React + Vite)

React + TypeScript frontend for DocuMind, integrated with FastAPI backend endpoints.

## Run

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:3000`

## Backend Integration

The UI calls backend APIs directly:

- `POST /upload`
- `POST /ask`
- `GET /history`
- `GET /stats`

Default backend base URL:

- `http://localhost:8000`

Override with env var (Vite):

```bash
# Windows PowerShell
$env:VITE_API_BASE_URL="http://localhost:8000"
npm run dev
```

## Package Files

Both files are required and present:

- `package.json` (dependencies + scripts)
- `package-lock.json` (locked dependency tree)

If dependency metadata gets out of sync, run:

```bash
cd frontend
npm install
```

## Notes

- Streamlit frontend artifacts were removed from `frontend/`.
- `src/vite-env.d.ts` includes Vite types so `import.meta.env` works with TypeScript.
