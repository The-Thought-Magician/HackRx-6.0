import httpx
import json
from typing import List, Dict, Any, Optional
from ..core.config import settings
from ..models.schemas import SourceClause

class TrieveService:
    def __init__(self):
        self.api_key = settings.TRIEVE_API_KEY
        self.dataset_id = settings.TRIEVE_DATASET_ID
        self.base_url = settings.TRIEVE_BASE_URL
        self.client = httpx.AsyncClient()
        
    def _get_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "TR-Dataset": self.dataset_id,
            "Content-Type": "application/json"
        }
    
    async def create_chunk(self, content: str, metadata: Dict[str, Any]) -> str:
        """Create a chunk in Trieve and return the chunk ID"""
        url = f"{self.base_url}/api/chunk"
        
        payload = {
            "chunk_html": content,
            "metadata": metadata,
            "tracking_id": metadata.get("tracking_id")
        }
        
        try:
            response = await self.client.post(
                url, 
                headers=self._get_headers(),
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            return result.get("id")
        except httpx.HTTPError as e:
            raise Exception(f"Failed to create chunk in Trieve: {str(e)}")
    
    async def upload_file_chunks(self, file_path: str, document_id: int, filename: str) -> List[str]:
        """Process and upload file chunks to Trieve"""
        # This would typically involve:
        # 1. Reading the file
        # 2. Extracting text content
        # 3. Chunking the content
        # 4. Creating chunks in Trieve
        
        # For now, simplified implementation
        chunks = []
        try:
            # Read file content (simplified - would need proper document parsing)
            with open(file_path, 'rb') as f:
                content = f.read()
            
            # Create basic chunks (this should be replaced with proper document processing)
            text_content = str(content)  # Simplified
            chunk_size = 1000
            
            for i in range(0, len(text_content), chunk_size):
                chunk_text = text_content[i:i + chunk_size]
                
                metadata = {
                    "document_id": document_id,
                    "filename": filename,
                    "chunk_index": i // chunk_size,
                    "tracking_id": f"doc_{document_id}_chunk_{i // chunk_size}"
                }
                
                chunk_id = await self.create_chunk(chunk_text, metadata)
                if chunk_id:
                    chunks.append(chunk_id)
            
            return chunks
            
        except Exception as e:
            raise Exception(f"Failed to process file chunks: {str(e)}")
    
    async def search_chunks(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search for relevant chunks in Trieve"""
        url = f"{self.base_url}/api/chunk/search"
        
        payload = {
            "query": query,
            "search_type": "hybrid",
            "page_size": limit,
            "get_collisions": False,
            "highlight_results": True
        }
        
        try:
            response = await self.client.post(
                url,
                headers=self._get_headers(),
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            return result.get("score_chunks", [])
        except httpx.HTTPError as e:
            raise Exception(f"Failed to search chunks in Trieve: {str(e)}")
    
    async def get_chunk_by_id(self, chunk_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific chunk by ID"""
        url = f"{self.base_url}/api/chunk/{chunk_id}"
        
        try:
            response = await self.client.get(
                url,
                headers=self._get_headers()
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise Exception(f"Failed to get chunk from Trieve: {str(e)}")
    
    def format_search_results_as_sources(self, search_results: List[Dict[str, Any]]) -> List[SourceClause]:
        """Convert Trieve search results to SourceClause objects"""
        sources = []
        
        for result in search_results:
            chunk = result.get("chunk", {})
            metadata = chunk.get("metadata", {})
            
            source = SourceClause(
                clause_text=chunk.get("chunk_html", ""),
                document_name=metadata.get("filename", "Unknown"),
                page_number=metadata.get("page_number"),
                confidence_score=result.get("score", 0.0)
            )
            sources.append(source)
        
        return sources
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

# Singleton instance
trieve_service = TrieveService()