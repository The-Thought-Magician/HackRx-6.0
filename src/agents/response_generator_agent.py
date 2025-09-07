from typing import Dict, Any, List
from .base_agent import BaseAgent
from ..models.schemas import QueryResponse, SourceClause

class ResponseGeneratorAgent(BaseAgent):
    """Agent responsible for generating the final structured response"""
    
    def __init__(self):
        super().__init__("ResponseGeneratorAgent")
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate the final structured response"""
        evaluation_result = input_data.get("evaluation_result", {})
        sources = input_data.get("sources", [])
        original_query = input_data.get("original_query", "")
        
        self.log_step(
            action="start_response_generation",
            reasoning="Beginning generation of structured response",
            output={"decision": evaluation_result.get("decision")}
        )
        
        # Extract key information from evaluation
        decision = evaluation_result.get("decision", "requires_more_info")
        amount = evaluation_result.get("amount")
        base_justification = evaluation_result.get("justification", "")
        confidence_score = evaluation_result.get("confidence_score", 0.5)
        supporting_evidence = evaluation_result.get("supporting_evidence", [])
        
        # Generate enhanced justification
        enhanced_justification = self._generate_enhanced_justification(
            decision, base_justification, supporting_evidence, original_query
        )
        
        # Format sources with proper references
        formatted_sources = self._format_sources(sources, supporting_evidence)
        
        # Create the final response
        response = QueryResponse(
            decision=decision,
            amount=amount,
            justification=enhanced_justification,
            sources=formatted_sources,
            confidence_score=confidence_score,
            processing_time_ms=0  # This will be set by the orchestrator
        )
        
        self.log_step(
            action="response_generated",
            reasoning="Successfully generated structured response",
            output={
                "decision": decision,
                "sources_count": len(formatted_sources),
                "confidence": confidence_score
            }
        )
        
        return {
            "response": response,
            "metadata": {
                "sources_used": len(formatted_sources),
                "evidence_pieces": len(supporting_evidence),
                "confidence_level": self._get_confidence_level(confidence_score)
            }
        }
    
    def _generate_enhanced_justification(self, decision: str, base_justification: str, 
                                       supporting_evidence: List[Dict[str, Any]], 
                                       original_query: str) -> str:
        """Generate an enhanced justification with specific references"""
        
        justification_parts = [base_justification]
        
        # Add decision-specific details
        if decision == "approved":
            justification_parts.append("The following policy provisions support this decision:")
        elif decision == "rejected":
            justification_parts.append("This claim is not covered due to the following policy restrictions:")
        elif decision == "requires_more_info":
            justification_parts.append("Additional documentation is needed due to:")
        
        # Add evidence references
        evidence_references = []
        for i, evidence in enumerate(supporting_evidence[:3]):  # Limit to top 3
            if evidence.get("text"):
                doc_name = evidence.get("document", "Policy Document")
                text_snippet = evidence.get("text", "")[:100] + "..."
                evidence_references.append(f"{i+1}. {doc_name}: \"{text_snippet}\"")
        
        if evidence_references:
            justification_parts.append("\n".join(evidence_references))
        
        # Add query context
        if original_query:
            justification_parts.append(f"This assessment is based on your query: \"{original_query}\"")
        
        return "\n\n".join(justification_parts)
    
    def _format_sources(self, sources: List[SourceClause], 
                       supporting_evidence: List[Dict[str, Any]]) -> List[SourceClause]:
        """Format and enhance source references"""
        formatted_sources = []
        
        # Use original sources as base
        for source in sources[:5]:  # Limit to top 5 sources
            formatted_sources.append(source)
        
        # Add any additional sources from supporting evidence
        evidence_docs = {ev.get("document") for ev in supporting_evidence if ev.get("document")}
        source_docs = {s.document_name for s in sources}
        
        # Add missing evidence documents as sources
        for doc_name in evidence_docs - source_docs:
            if len(formatted_sources) < 5:  # Don't exceed 5 sources
                # Find the evidence for this document
                evidence = next((ev for ev in supporting_evidence if ev.get("document") == doc_name), None)
                if evidence:
                    new_source = SourceClause(
                        clause_text=evidence.get("text", "")[:500] + "...",
                        document_name=doc_name,
                        page_number=evidence.get("page"),
                        confidence_score=evidence.get("confidence", 0.5)
                    )
                    formatted_sources.append(new_source)
        
        return formatted_sources
    
    def _get_confidence_level(self, confidence_score: float) -> str:
        """Convert confidence score to human-readable level"""
        if confidence_score >= 0.8:
            return "high"
        elif confidence_score >= 0.6:
            return "medium"
        elif confidence_score >= 0.4:
            return "low"
        else:
            return "very_low"
    
    def _add_disclaimers(self, decision: str) -> List[str]:
        """Add appropriate disclaimers based on decision"""
        disclaimers = []
        
        if decision == "approved":
            disclaimers.append(
                "This preliminary assessment is based on available policy information. "
                "Final approval may require additional verification and documentation."
            )
        elif decision == "rejected":
            disclaimers.append(
                "This assessment is based on standard policy terms. "
                "You may appeal this decision or request a manual review."
            )
        elif decision == "requires_more_info":
            disclaimers.append(
                "Please provide additional documentation for a complete assessment. "
                "This includes medical records, policy details, or other relevant information."
            )
        
        disclaimers.append(
            "This automated assessment should be reviewed by a qualified insurance professional."
        )
        
        return disclaimers