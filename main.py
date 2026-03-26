"""
Unified Launcher for RAG System
Starts FastAPI backend
"""

import subprocess
import sys
import os
import time
import signal
from pathlib import Path

def ensure_venv_python():
    """Re-exec launcher with local .venv Python if available and not already active."""
    root = Path(__file__).parent
    venv_python = root / ".venv" / ("Scripts" if os.name == "nt" else "bin") / ("python.exe" if os.name == "nt" else "python")

    if not venv_python.exists():
        return

    current_python = Path(sys.executable).resolve()
    target_python = venv_python.resolve()
    if current_python == target_python:
        return

    print("Switching to project virtual environment (.venv)...")
    os.execv(str(target_python), [str(target_python), str(Path(__file__).resolve())] + sys.argv[1:])

def check_dependencies():
    """Check if required packages are installed"""
    packages = {
        'fastapi': 'fastapi',
        'uvicorn': 'uvicorn',
        'langchain-core': 'langchain_core',
        'python-dotenv': 'dotenv',
        'pydantic': 'pydantic'
    }
    
    missing = []
    for package, import_name in packages.items():
        try:
            __import__(import_name)
        except Exception:
            missing.append(package)
    
    if missing:
        print(f"Missing packages: {', '.join(missing)}")
        print("Please run: pip install -r requirements.txt")
        return False
    
    return True

def check_env_file():
    """Check if .env file exists"""
    env_path = Path(__file__).parent / ".env"
    if not env_path.exists():
        print(".env file not found. Please copy .env.template to .env and configure API keys.")
        return False
    
    return True

def start_backend(port=8000):
    """Start FastAPI backend server"""
    print(f"Starting FastAPI backend on port {port}...")
    
    # Start uvicorn in subprocess
    backend_process = subprocess.Popen(
        [
            sys.executable, "-m", "uvicorn",
            "backend.api:app",
            "--host", "0.0.0.0",
            "--port", str(port),
            "--reload"
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
        bufsize=1
    )
    
    time.sleep(3)
    
    if backend_process.poll() is None:
        print(f"Backend running at http://localhost:{port}")
        return backend_process
    else:
        print("Backend failed to start.")
        return None

def shutdown_handler(processes):
    """Cleanup handler for Ctrl+C"""
    def handler(signum, frame):
        print("\nShutting down servers...")
        for name, process in processes.items():
            if process and process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
        print("Shutdown complete.")
        sys.exit(0)
    return handler

def main():
    """Main launcher"""
    ensure_venv_python()

    # Pre-flight checks
    if not check_dependencies() or not check_env_file():
        sys.exit(1)
    
    processes = {}
    
    backend = start_backend(port=8000)
    if backend is None:
        sys.exit(1)
        
    processes['Backend'] = backend
    
    signal.signal(signal.SIGINT, shutdown_handler(processes))
    
    print("System is running. Press Ctrl+C to stop.")
    
    try:
        while True:
            time.sleep(1)
            for name, process in processes.items():
                if process.poll() is not None:
                    print(f"{name} stopped unexpectedly!")
                    for other_name, other_process in processes.items():
                        if other_name != name and other_process.poll() is None:
                            other_process.terminate()
                    sys.exit(1)
    
    except KeyboardInterrupt:
        shutdown_handler(processes)(None, None)

if __name__ == "__main__":
    main()
