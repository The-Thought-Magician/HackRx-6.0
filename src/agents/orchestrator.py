import time
from typing import Dict, Any, List
from .query_parser_agent import QueryParserAgent
from .retrieval_agent import RetrievalAgent
from .evaluation_agent import EvaluationAgent
from .response_generator_agent import ResponseGeneratorAgent
from ..models.schemas import MultiAgentResponse, AgentStep

class AgentOrchestrator:
    """Orchestrates the multi-agent system for processing queries"""
    
    def __init__(self):
        self.query_parser = QueryParserAgent()
        self.retrieval_agent = RetrievalAgent()
        self.evaluation_agent = EvaluationAgent()
        self.response_generator = ResponseGeneratorAgent()
        
        self.agents = [
            self.query_parser,
            self.retrieval_agent,
            self.evaluation_agent,
            self.response_generator
        ]
    
    async def process_query(self, query: str, max_chunks: int = 10, include_metadata: bool = True) -> MultiAgentResponse:
        """Process a query through the multi-agent pipeline"""
        start_time = time.time()
        
        # Reset all agent steps
        for agent in self.agents:
            agent.reset_steps()
        
        try:
            # Stage 1: Query Parsing
            parsing_result = await self.query_parser.process({
                "query": query
            })
            
            # Stage 2: Information Retrieval
            retrieval_input = {
                "search_query": parsing_result.get("search_query", query),
                "search_keywords": parsing_result.get("search_keywords", []),
                "max_chunks": max_chunks
            }
            retrieval_result = await self.retrieval_agent.process(retrieval_input)
            
            # Stage 3: Evaluation and Decision Making
            evaluation_input = {
                "structured_data": parsing_result.get("structured_data", {}),
                "relevant_chunks": retrieval_result.get("relevant_chunks", []),
                "sources": retrieval_result.get("sources", [])
            }
            evaluation_result = await self.evaluation_agent.process(evaluation_input)
            
            # Stage 4: Response Generation
            response_input = {
                "evaluation_result": evaluation_result,
                "sources": retrieval_result.get("sources", []),
                "original_query": query
            }
            response_result = await self.response_generator.process(response_input)
            
            # Calculate total processing time
            total_time_ms = int((time.time() - start_time) * 1000)
            
            # Update response with processing time
            final_response = response_result.get("response")
            final_response.processing_time_ms = total_time_ms
            
            # Collect all agent steps
            all_steps = []
            for agent in self.agents:
                all_steps.extend(agent.get_steps())
            
            return MultiAgentResponse(
                final_response=final_response,
                agent_steps=all_steps,
                total_processing_time_ms=total_time_ms
            )
            
        except Exception as e:
            # Handle errors gracefully
            error_time_ms = int((time.time() - start_time) * 1000)
            
            # Create error response
            from ..models.schemas import QueryResponse, SourceClause
            error_response = QueryResponse(
                decision="error",
                amount=None,
                justification=f"An error occurred while processing your query: {str(e)}",
                sources=[],
                confidence_score=0.0,
                processing_time_ms=error_time_ms
            )
            
            # Collect steps from agents that did execute
            all_steps = []
            for agent in self.agents:
                all_steps.extend(agent.get_steps())
            
            # Add error step
            error_step = AgentStep(
                agent_name="Orchestrator",
                action="error_handling",
                reasoning=f"Pipeline failed with error: {str(e)}",
                output={"error": str(e), "stage": "unknown"}
            )
            all_steps.append(error_step)
            
            return MultiAgentResponse(
                final_response=error_response,
                agent_steps=all_steps,
                total_processing_time_ms=error_time_ms
            )
    
    def get_pipeline_status(self) -> Dict[str, Any]:
        """Get the current status of the pipeline"""
        return {
            "agents": [agent.name for agent in self.agents],
            "total_agents": len(self.agents),
            "pipeline_stages": [
                "Query Parsing",
                "Information Retrieval", 
                "Evaluation & Decision Making",
                "Response Generation"
            ]
        }
    
    async def validate_pipeline(self) -> Dict[str, Any]:
        """Validate that all pipeline components are working"""
        validation_results = {}
        
        # Test each agent with sample data
        try:
            # Test query parser
            parser_result = await self.query_parser.process({
                "query": "46-year-old male, knee surgery in Pune, 3-month-old insurance policy"
            })
            validation_results["query_parser"] = {
                "status": "ok",
                "structured_data_extracted": bool(parser_result.get("structured_data"))
            }
        except Exception as e:
            validation_results["query_parser"] = {
                "status": "error",
                "error": str(e)
            }
        
        # Test other agents would require actual data, so we'll just check they're initialized
        for agent in [self.retrieval_agent, self.evaluation_agent, self.response_generator]:
            validation_results[agent.name.lower()] = {
                "status": "initialized",
                "ready": True
            }
        
        return {
            "overall_status": "ok" if all(
                result.get("status") in ["ok", "initialized"] 
                for result in validation_results.values()
            ) else "error",
            "agent_results": validation_results
        }

# Singleton instance
orchestrator = AgentOrchestrator()