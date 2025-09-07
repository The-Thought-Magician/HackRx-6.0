from typing import Dict, Any, List
from .base_agent import BaseAgent
from ..services.qdrant_service import qdrant_service
from ..models.schemas import SourceClause

class RetrievalAgent(BaseAgent):
    """Agent responsible for retrieving relevant information from documents"""
    
    def __init__(self):
        super().__init__("RetrievalAgent")
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Retrieve relevant document chunks based on parsed query"""
        search_query = input_data.get("search_query", "")
        max_chunks = input_data.get("max_chunks", 10)
        
        self.log_step(
            action="initiate_search",
            reasoning="Starting search for relevant document chunks",
            output={"search_query": search_query, "max_chunks": max_chunks}
        )
        
        try:
            # Search for relevant chunks using Qdrant
            search_results = await qdrant_service.search_chunks(
                query=search_query,
                limit=max_chunks
            )
            
            self.log_step(
                action="search_completed",
                reasoning=f"Found {len(search_results)} relevant chunks",
                output={"results_count": len(search_results)}
            )
            
            # Convert search results to source clauses
            sources = qdrant_service.format_search_results_as_sources(search_results)
            
            # Extract relevant information for decision making
            relevant_info = []
            for source in sources:
                relevant_info.append({
                    "text": source.clause_text,
                    "document": source.document_name,
                    "confidence": source.confidence_score,
                    "page": source.page_number
                })
            
            # Rank results by relevance
            relevant_info.sort(key=lambda x: x["confidence"], reverse=True)
            
            result = {
                "sources": sources,
                "relevant_chunks": relevant_info,
                "total_found": len(search_results),
                "search_query_used": search_query
            }
            
            self.log_step(
                action="process_results",
                reasoning="Successfully processed and ranked search results",
                output={"top_confidence": relevant_info[0]["confidence"] if relevant_info else 0}
            )
            
            return result
            
        except Exception as e:
            error_result = {
                "error": str(e),
                "sources": [],
                "relevant_chunks": [],
                "total_found": 0,
                "search_query_used": search_query
            }
            
            self.log_step(
                action="search_failed",
                reasoning=f"Search failed due to error: {str(e)}",
                output=error_result
            )
            
            return error_result
    
    def filter_by_keywords(self, chunks: List[Dict[str, Any]], keywords: List[str]) -> List[Dict[str, Any]]:
        """Filter chunks by additional keywords"""
        if not keywords:
            return chunks
        
        filtered = []
        for chunk in chunks:
            text = chunk.get("text", "").lower()
            if any(keyword.lower() in text for keyword in keywords):
                filtered.append(chunk)
        
        return filtered
    
    def get_context_window(self, chunks: List[Dict[str, Any]], target_chunk_id: str, window_size: int = 2) -> List[Dict[str, Any]]:
        """Get surrounding chunks for better context"""
        # This would be implemented if we had chunk ordering information
        # For now, return the original chunks
        return chunks