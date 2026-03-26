"""
Unified Launcher for RAG System
Starts FastAPI backend with a basic built-in HTML test page
"""

import subprocess
import sys
import os
import time
import signal
from pathlib import Path

# Force UTF-8 for emoji support in cmd/powershell
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_colored(message, color):
    """Print colored message"""
    print(f"{color}{message}{Colors.ENDC}")

def ensure_venv_python():
    """Re-exec launcher with local .venv Python if available and not already active."""
    root = Path(__file__).parent
    if os.name == "nt":
        venv_python = root / ".venv" / "Scripts" / "python.exe"
    else:
        venv_python = root / ".venv" / "bin" / "python"

    if not venv_python.exists():
        return

    current_python = Path(sys.executable).resolve()
    target_python = venv_python.resolve()
    if current_python == target_python:
        return

    print_colored("\n[>] Switching to project virtual environment (.venv)...", Colors.YELLOW)
    os.execv(str(target_python), [str(target_python), str(Path(__file__).resolve())] + sys.argv[1:])

def check_dependencies():
    """Check if required packages are installed"""
    print_colored("\n[?] Checking dependencies...", Colors.BLUE)
    
    # Map package names to import names
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
        except Exception as e:
            # Capture any exception raised during import and include details so
            # we can diagnose cases where import fails with a runtime error
            missing.append(f"{package} (import error: {e.__class__.__name__}: {e})")
    
    if missing:
        print_colored(f"[X] Missing packages: {', '.join(missing)}", Colors.RED)
        print_colored("\n[!] Install with: pip install -r requirements.txt", Colors.YELLOW)
        return False
    
    print_colored("[OK] All dependencies installed", Colors.GREEN)
    return True

def check_env_file():
    """Check if .env file exists"""
    print_colored("\n[?] Checking configuration...", Colors.BLUE)
    
    env_path = Path(__file__).parent / ".env"
    if not env_path.exists():
        print_colored("[X] .env file not found", Colors.RED)
        print_colored("[!] Copy .env.template to .env and configure API keys", Colors.YELLOW)
        return False
    
    print_colored("[OK] Configuration file found", Colors.GREEN)
    return True

def start_backend(port=8000):
    """Start FastAPI backend server"""
    print_colored(f"\n[>] Starting FastAPI backend on port {port}...", Colors.BLUE)
    
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
    
    # Wait for backend to start
    print_colored("⏳ Waiting for backend to initialize...", Colors.YELLOW)
    time.sleep(3)
    
    if backend_process.poll() is None:
        print_colored(f"[OK] Backend running at http://localhost:{port}", Colors.GREEN)
        print_colored(f"[i] API docs at http://localhost:{port}/docs", Colors.GREEN)
        return backend_process
    else:
        print_colored("[X] Backend failed to start", Colors.RED)
        return None

def shutdown_handler(processes):
    """Cleanup handler for Ctrl+C"""
    def handler(signum, frame):
        print_colored("\n\n[!] Shutting down servers...", Colors.YELLOW)
        for name, process in processes.items():
            if process and process.poll() is None:
                print_colored(f"  Stopping {name}...", Colors.YELLOW)
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
        print_colored("[OK] Shutdown complete", Colors.GREEN)
        sys.exit(0)
    return handler

def main():
    """Main launcher"""
    ensure_venv_python()

    print_colored("=" * 60, Colors.HEADER)
    print_colored("DocuMind — AI RAG Chat System", Colors.HEADER + Colors.BOLD)
    print_colored("=" * 60, Colors.HEADER)
    
    # Pre-flight checks
    if not check_dependencies():
        sys.exit(1)
    
    if not check_env_file():
        sys.exit(1)
    
    # Start servers
    processes = {}
    
    # Start backend
    backend = start_backend(port=8000)
    if backend is None:
        print_colored("\n[X] Failed to start backend. Check logs above.", Colors.RED)
        sys.exit(1)
    processes['Backend'] = backend
    
    # Setup shutdown handler
    signal.signal(signal.SIGINT, shutdown_handler(processes))
    
    # Show status
    print_colored("\n" + "=" * 60, Colors.GREEN)
    print_colored("[OK] RAG SYSTEM RUNNING", Colors.GREEN + Colors.BOLD)
    print_colored("=" * 60, Colors.GREEN)
    print_colored("\n[i] Access Points:", Colors.BOLD)
    print_colored("       Basic HTML UI:  http://localhost:8000/", Colors.BLUE)
    print_colored("       Backend API:    http://localhost:8000", Colors.BLUE)
    print_colored("       API Docs:       http://localhost:8000/docs", Colors.BLUE)
    print_colored("\n[!]  Press Ctrl+C to stop all servers\n", Colors.YELLOW)
    print_colored("=" * 60, Colors.HEADER)
    
    # Monitor processes
    try:
        while True:
            time.sleep(1)
            
            for name, process in processes.items():
                if process.poll() is not None:
                    print_colored(f"\n[X] {name} stopped unexpectedly!", Colors.RED)
                    # Kill other processes
                    for other_name, other_process in processes.items():
                        if other_name != name and other_process.poll() is None:
                            other_process.terminate()
                    sys.exit(1)
    
    except KeyboardInterrupt:
        shutdown_handler(processes)(None, None)

if __name__ == "__main__":
    main()
