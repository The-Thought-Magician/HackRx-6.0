import httpx
import json
from typing import List, Dict, Any, Optional
from ..core.config import settings
from ..models.schemas import SourceClause

class QdrantService:
    def __init__(self):
        self.base_url = settings.QDRANT_URL or "http://localhost:6333"
        self.api_key = settings.QDRANT_API_KEY
        self.client = httpx.AsyncClient()
        self.collection_name = "insurance_documents"
        
    def _get_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["api-key"] = self.api_key
        return headers
    
    async def create_collection(self, vector_size: int = 1536) -> bool:
        """Create a collection for insurance documents"""
        url = f"{self.base_url}/collections/{self.collection_name}"
        
        payload = {
            "vectors": {
                "size": vector_size,
                "distance": "Cosine"
            }
        }
        
        try:
            response = await self.client.put(
                url, 
                headers=self._get_headers(),
                json=payload
            )
            return response.status_code in [200, 201]
        except httpx.HTTPError:
            return False
    
    async def add_points(self, points: List[Dict[str, Any]]) -> bool:
        """Add points to the collection"""
        url = f"{self.base_url}/collections/{self.collection_name}/points"
        
        payload = {
            "points": points
        }
        
        try:
            response = await self.client.put(
                url,
                headers=self._get_headers(),
                json=payload
            )
            return response.status_code == 200
        except httpx.HTTPError:
            return False
    
    async def search_points(self, query_vector: List[float], limit: int = 10) -> List[Dict[str, Any]]:
        """Search for similar points"""
        url = f"{self.base_url}/collections/{self.collection_name}/points/search"
        
        payload = {
            "vector": query_vector,
            "limit": limit,
            "with_payload": True,
            "with_vector": False
        }
        
        try:
            response = await self.client.post(
                url,
                headers=self._get_headers(),
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            return result.get("result", [])
        except httpx.HTTPError:
            return []
    
    async def upload_file_chunks(self, file_path: str, document_id: int, filename: str) -> List[str]:
        """Process and upload file chunks to Qdrant"""
        # For now, basic text processing
        chunk_ids = []
        
        try:
            # Read file content (simplified)
            with open(file_path, 'rb') as f:
                content = f.read()
            
            # Basic text extraction (would need proper document processing)
            text_content = str(content)[:10000]  # Limit to prevent issues
            
            # Create chunks
            chunk_size = 1000
            chunks = []
            
            for i in range(0, len(text_content), chunk_size):
                chunk_text = text_content[i:i + chunk_size]
                chunk_id = f"doc_{document_id}_chunk_{len(chunks)}"
                
                # Create embedding (mock for now - would use OpenAI)
                embedding = [0.1] * 1536  # Mock embedding
                
                point = {
                    "id": chunk_id,
                    "vector": embedding,
                    "payload": {
                        "document_id": document_id,
                        "filename": filename,
                        "text": chunk_text,
                        "chunk_index": len(chunks)
                    }
                }
                chunks.append(point)
                chunk_ids.append(chunk_id)
            
            # Ensure collection exists
            await self.create_collection()
            
            # Add points in batches
            batch_size = 100
            for i in range(0, len(chunks), batch_size):
                batch = chunks[i:i + batch_size]
                await self.add_points(batch)
            
            return chunk_ids
            
        except Exception as e:
            raise Exception(f"Failed to process file chunks: {str(e)}")
    
    async def search_chunks(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search for relevant chunks"""
        # Mock query embedding (would use OpenAI)
        query_embedding = [0.1] * 1536
        
        results = await self.search_points(query_embedding, limit)
        
        # Convert to expected format
        search_results = []
        for result in results:
            search_results.append({
                "chunk": {
                    "chunk_html": result.get("payload", {}).get("text", ""),
                    "metadata": {
                        "filename": result.get("payload", {}).get("filename", ""),
                        "document_id": result.get("payload", {}).get("document_id"),
                        "chunk_index": result.get("payload", {}).get("chunk_index")
                    }
                },
                "score": result.get("score", 0)
            })
        
        return search_results
    
    def format_search_results_as_sources(self, search_results: List[Dict[str, Any]]) -> List[SourceClause]:
        """Convert search results to SourceClause objects"""
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
qdrant_service = QdrantService()