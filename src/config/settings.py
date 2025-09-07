"""
Production Configuration Management
==================================

Environment-based configuration with security, performance, and deployment settings.
"""

import os
from typing import Optional, List, Dict, Any
from pydantic import BaseSettings, Field, validator
from pydantic_settings import BaseSettings as PydanticBaseSettings
from enum import Enum


class Environment(str, Enum):
    """Deployment environment types"""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class LLMProvider(str, Enum):
    """Supported LLM providers"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    AZURE_OPENAI = "azure_openai"


class VectorDBProvider(str, Enum):
    """Supported vector database providers"""
    QDRANT = "qdrant"
    WEAVIATE = "weaviate"
    CHROMA = "chroma"
    FAISS = "faiss"


class Settings(PydanticBaseSettings):
    """Main application settings with environment variable support"""
    
    # Environment Configuration
    environment: Environment = Field(default=Environment.DEVELOPMENT, env="ENVIRONMENT")
    debug: bool = Field(default=False, env="DEBUG")
    
    # API Configuration
    api_title: str = Field(default="Insurance RAG API", env="API_TITLE")
    api_version: str = Field(default="1.0.0", env="API_VERSION")
    api_host: str = Field(default="0.0.0.0", env="API_HOST")
    api_port: int = Field(default=8000, env="API_PORT")
    
    # Security Configuration
    secret_key: str = Field(..., env="SECRET_KEY")
    access_token_expire_minutes: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # LLM Configuration
    llm_provider: LLMProvider = Field(default=LLMProvider.OPENAI, env="LLM_PROVIDER")
    llm_model: str = Field(default="gpt-4-0125-preview", env="LLM_MODEL")
    llm_temperature: float = Field(default=0.1, env="LLM_TEMPERATURE")
    llm_max_tokens: int = Field(default=4096, env="LLM_MAX_TOKENS")
    
    # OpenAI Configuration
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    openai_base_url: Optional[str] = Field(default=None, env="OPENAI_BASE_URL")
    
    # Anthropic Configuration
    anthropic_api_key: Optional[str] = Field(default=None, env="ANTHROPIC_API_KEY")
    
    # Azure OpenAI Configuration
    azure_openai_endpoint: Optional[str] = Field(default=None, env="AZURE_OPENAI_ENDPOINT")
    azure_openai_api_key: Optional[str] = Field(default=None, env="AZURE_OPENAI_API_KEY")
    azure_openai_api_version: str = Field(default="2024-02-01", env="AZURE_OPENAI_API_VERSION")
    
    # Embedding Configuration
    embedding_model: str = Field(default="text-embedding-3-large", env="EMBEDDING_MODEL")
    embedding_dimensions: int = Field(default=3072, env="EMBEDDING_DIMENSIONS")
    
    # Vector Database Configuration
    vector_db_provider: VectorDBProvider = Field(default=VectorDBProvider.QDRANT, env="VECTOR_DB_PROVIDER")
    
    # Qdrant Configuration (Primary)
    qdrant_url: str = Field(default="http://localhost:6333", env="QDRANT_URL")
    qdrant_api_key: Optional[str] = Field(default=None, env="QDRANT_API_KEY")
    qdrant_collection_name: str = Field(default="insurance_documents", env="QDRANT_COLLECTION_NAME")
    
    # Weaviate Configuration (Fallback)
    weaviate_url: str = Field(default="http://localhost:8080", env="WEAVIATE_URL")
    weaviate_api_key: Optional[str] = Field(default=None, env="WEAVIATE_API_KEY")
    
    # Knowledge Graph Configuration
    neo4j_uri: str = Field(default="bolt://localhost:7687", env="NEO4J_URI")
    neo4j_username: str = Field(default="neo4j", env="NEO4J_USERNAME")
    neo4j_password: str = Field(default="password", env="NEO4J_PASSWORD")
    neo4j_database: str = Field(default="neo4j", env="NEO4J_DATABASE")
    
    # Graphiti Configuration
    graphiti_api_key: Optional[str] = Field(default=None, env="GRAPHITI_API_KEY")
    graphiti_base_url: str = Field(default="https://api.graphiti.ai", env="GRAPHITI_BASE_URL")
    
    # Redis Configuration (Caching)
    redis_url: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    redis_password: Optional[str] = Field(default=None, env="REDIS_PASSWORD")
    cache_ttl_seconds: int = Field(default=3600, env="CACHE_TTL_SECONDS")
    
    # Document Processing Configuration
    max_file_size_mb: int = Field(default=100, env="MAX_FILE_SIZE_MB")
    supported_file_types: List[str] = Field(
        default=["pdf", "docx", "doc", "txt", "eml"], 
        env="SUPPORTED_FILE_TYPES"
    )
    
    # Processing Configuration
    max_concurrent_requests: int = Field(default=10, env="MAX_CONCURRENT_REQUESTS")
    request_timeout_seconds: int = Field(default=60, env="REQUEST_TIMEOUT_SECONDS")
    chunk_size: int = Field(default=1000, env="CHUNK_SIZE")
    chunk_overlap: int = Field(default=200, env="CHUNK_OVERLAP")
    
    # Monitoring Configuration
    enable_prometheus_metrics: bool = Field(default=True, env="ENABLE_PROMETHEUS_METRICS")
    prometheus_port: int = Field(default=9090, env="PROMETHEUS_PORT")
    
    # Logging Configuration
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = Field(default="json", env="LOG_FORMAT")
    
    # Security and Privacy Configuration
    enable_pii_redaction: bool = Field(default=True, env="ENABLE_PII_REDACTION")
    enable_audit_logging: bool = Field(default=True, env="ENABLE_AUDIT_LOGGING")
    max_query_length: int = Field(default=10000, env="MAX_QUERY_LENGTH")
    
    # Performance Configuration
    enable_caching: bool = Field(default=True, env="ENABLE_CACHING")
    batch_processing_size: int = Field(default=32, env="BATCH_PROCESSING_SIZE")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
    
    @validator("secret_key")
    def validate_secret_key(cls, v):
        if len(v) < 32:
            raise ValueError("Secret key must be at least 32 characters long")
        return v
    
    @validator("llm_temperature")
    def validate_temperature(cls, v):
        if not 0.0 <= v <= 2.0:
            raise ValueError("Temperature must be between 0.0 and 2.0")
        return v
    
    @validator("chunk_size")
    def validate_chunk_size(cls, v):
        if v < 100 or v > 10000:
            raise ValueError("Chunk size must be between 100 and 10000")
        return v
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment"""
        return self.environment == Environment.PRODUCTION
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment"""
        return self.environment == Environment.DEVELOPMENT
    
    def get_llm_config(self) -> Dict[str, Any]:
        """Get LLM configuration based on provider"""
        base_config = {
            "model": self.llm_model,
            "temperature": self.llm_temperature,
            "max_tokens": self.llm_max_tokens,
        }
        
        if self.llm_provider == LLMProvider.OPENAI:
            return {
                **base_config,
                "api_key": self.openai_api_key,
                "base_url": self.openai_base_url,
            }
        elif self.llm_provider == LLMProvider.ANTHROPIC:
            return {
                **base_config,
                "api_key": self.anthropic_api_key,
            }
        elif self.llm_provider == LLMProvider.AZURE_OPENAI:
            return {
                **base_config,
                "api_key": self.azure_openai_api_key,
                "azure_endpoint": self.azure_openai_endpoint,
                "api_version": self.azure_openai_api_version,
            }
        
        return base_config
    
    def get_vector_db_config(self) -> Dict[str, Any]:
        """Get vector database configuration based on provider"""
        if self.vector_db_provider == VectorDBProvider.QDRANT:
            return {
                "url": self.qdrant_url,
                "api_key": self.qdrant_api_key,
                "collection_name": self.qdrant_collection_name,
            }
        elif self.vector_db_provider == VectorDBProvider.WEAVIATE:
            return {
                "url": self.weaviate_url,
                "api_key": self.weaviate_api_key,
            }
        
        return {}


class DevelopmentSettings(Settings):
    """Development-specific settings"""
    debug: bool = True
    log_level: str = "DEBUG"
    enable_caching: bool = False
    
    class Config(Settings.Config):
        env_file = ".env.development"


class ProductionSettings(Settings):
    """Production-specific settings"""
    debug: bool = False
    log_level: str = "INFO"
    enable_prometheus_metrics: bool = True
    enable_audit_logging: bool = True
    enable_pii_redaction: bool = True
    
    class Config(Settings.Config):
        env_file = ".env.production"


# Factory function to get appropriate settings
def get_settings() -> Settings:
    """Get settings based on environment"""
    env = os.getenv("ENVIRONMENT", "development").lower()
    
    if env == "development":
        return DevelopmentSettings()
    elif env == "production":
        return ProductionSettings()
    else:
        return Settings()


# Global settings instance
settings = get_settings()