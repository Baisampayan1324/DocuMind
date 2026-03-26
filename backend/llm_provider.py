# backend/llm_provider.py
import os
import logging
from typing import List, Optional

from .config import Config

# Import vendor wrappers - adjust if your LangChain version expects different import paths
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq

try:
    from langchain_google_genai import ChatGoogleGenerativeAI
except Exception:  # pragma: no cover - optional dependency path
    ChatGoogleGenerativeAI = None

try:
    from langchain_community.chat_models import ChatOllama
except Exception:  # pragma: no cover - optional dependency path
    ChatOllama = None

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class LLMProvider:
    """
    Manage multiple LLM providers with a configurable priority order.
    Exposes:
      - get_llm(provider_name)
      - get_preferred_provider()
      - get_working_providers()
      - test_provider(provider_name)
    """

    def __init__(self):
        self.providers = {}
        self._sync_env_from_config()
        self._init_providers()

    def _sync_env_from_config(self):
        """Expose provider keys to SDKs that read from process environment."""
        if Config.GROQ_API_KEY:
            os.environ["GROQ_API_KEY"] = Config.GROQ_API_KEY
        if Config.OPENROUTER_API_KEY:
            os.environ["OPENROUTER_API_KEY"] = Config.OPENROUTER_API_KEY
        if Config.OPENAI_API_KEY:
            os.environ["OPENAI_API_KEY"] = Config.OPENAI_API_KEY
        if Config.GEMINI_API_KEY:
            os.environ["GEMINI_API_KEY"] = Config.GEMINI_API_KEY
            os.environ["GOOGLE_API_KEY"] = Config.GEMINI_API_KEY
        if Config.OLLAMA_API_KEY:
            os.environ["OLLAMA_API_KEY"] = Config.OLLAMA_API_KEY

    def _init_providers(self):
        # Groq
        if Config.GROQ_API_KEY:
            try:
                self.providers["groq"] = ChatGroq(
                    model=Config.GROQ_MODEL,
                    temperature=0
                )
                logger.info("Groq initialized: %s", Config.GROQ_MODEL)
            except Exception as e:
                logger.warning("Groq init failed: %s", e)

        # OpenRouter (use ChatOpenAI wrapper pointed at openrouter base)
        if Config.OPENROUTER_API_KEY:
            try:
                self.providers["openrouter"] = ChatOpenAI(
                    model=Config.OPENROUTER_MODEL,
                    base_url="https://openrouter.ai/api/v1",
                    api_key=Config.OPENROUTER_API_KEY,
                    temperature=0
                )
                logger.info("OpenRouter initialized: %s", Config.OPENROUTER_MODEL)
            except Exception as e:
                logger.warning("OpenRouter init failed: %s", e)

        # OpenAI
        if Config.OPENAI_API_KEY:
            try:
                self.providers["openai"] = ChatOpenAI(
                    model=Config.OPENAI_MODEL,
                    api_key=Config.OPENAI_API_KEY,
                    temperature=0
                )
                logger.info("OpenAI initialized: %s", Config.OPENAI_MODEL)
            except Exception as e:
                logger.warning("OpenAI init failed: %s", e)

        # Gemini
        if Config.GEMINI_API_KEY and ChatGoogleGenerativeAI is not None:
            try:
                self.providers["gemini"] = ChatGoogleGenerativeAI(
                    model=Config.GEMINI_MODEL,
                    google_api_key=Config.GEMINI_API_KEY,
                    temperature=0
                )
                logger.info("Gemini initialized: %s", Config.GEMINI_MODEL)
            except Exception as e:
                logger.warning("Gemini init failed: %s", e)
        elif Config.GEMINI_API_KEY and ChatGoogleGenerativeAI is None:
            logger.info("Gemini key is set but langchain_google_genai is unavailable.")

        # Ollama (local/self-hosted)
        if ChatOllama is not None:
            try:
                self.providers["ollama"] = ChatOllama(
                    model=Config.OLLAMA_MODEL,
                    base_url=Config.OLLAMA_BASE_URL,
                    temperature=0
                )
                logger.info("Ollama initialized: %s at %s", Config.OLLAMA_MODEL, Config.OLLAMA_BASE_URL)
            except Exception as e:
                logger.warning("Ollama init failed: %s", e)
        else:
            logger.info("ChatOllama not available from langchain_community; skipping Ollama provider.")

        if not self.providers:
            logger.warning("No LLM providers initialized. Check your config/API keys.")

    def reload_providers(self):
        """Rebuild provider clients after runtime config changes."""
        self.providers = {}
        self._sync_env_from_config()
        self._init_providers()

    def get_llm(self, provider: Optional[str] = None):
        """
        Return an LLM object. If provider is None, return the first available provider
        according to Config.PROVIDER_PRIORITY (if provided) or insertion order.
        """
        if provider:
            if provider in self.providers:
                return self.providers[provider]
            else:
                logger.info("Requested provider '%s' not available.", provider)

        # Select first available by configured priority
        preferred = self.get_preferred_provider()
        if preferred:
            return self.providers[preferred]

        raise RuntimeError("No LLM provider available")

    def get_preferred_provider(self) -> Optional[str]:
        """
        Determine preferred provider based on Config.PROVIDER_PRIORITY (list) or insertion order.
        Returns provider name or None.
        """
        priority = getattr(Config, "PROVIDER_PRIORITY", None)
        if priority:
            for p in priority:
                if p in self.providers:
                    return p
        # fallback to insertion order of providers dict
        for p in self.providers:
            return p
        return None

    def test_provider(self, provider: str) -> bool:
        """
        Basic health check for a provider. Sends a harmless prompt and expects 'OK' or an answer.
        Returns True if provider responds without throwing.
        """
        try:
            if provider not in self.providers:
                logger.debug("Provider %s not initialized", provider)
                return False
            llm = self.providers[provider]

            # Use latest LangChain message format if available
            try:
                from langchain_core.messages import HumanMessage
                response = llm.invoke([HumanMessage(content="Please respond with OK if you are working.")])
                # response may be an object with .content or a raw string
                text = getattr(response, "content", str(response))
                return "ok" in text.lower() or bool(text.strip())
            except Exception:
                # fallback to raw invoke with string if message API not available
                resp = llm.invoke("Please respond with OK if you are working.")
                text = getattr(resp, "content", str(resp))
                return "ok" in text.lower() or bool(text.strip())

        except Exception as e:
            logger.warning("Provider %s health check failed: %s", provider, e)
            return False

    def get_working_providers(self) -> List[str]:
        """
        Return list of providers that pass health checks in priority order.
        """
        working = []
        priority = getattr(Config, "PROVIDER_PRIORITY", None)
        if priority:
            candidates = list(priority)
        else:
            candidates = list(self.providers.keys())

        for p in candidates:
            if p in self.providers and self.test_provider(p):
                working.append(p)
        return working
