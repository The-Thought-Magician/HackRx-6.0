import json
from typing import Dict, Any, List, Optional
from .base_agent import BaseAgent

class EvaluationAgent(BaseAgent):
    """Agent responsible for evaluating retrieved information and making decisions"""
    
    def __init__(self):
        super().__init__("EvaluationAgent")
        
        # Define evaluation criteria and rules
        self.evaluation_rules = {
            "coverage_keywords": [
                "covered", "eligible", "included", "benefits", "payable",
                "reimbursement", "compensation", "claim"
            ],
            "exclusion_keywords": [
                "excluded", "not covered", "limitation", "restriction",
                "pre-existing", "waiting period", "deductible"
            ],
            "procedure_coverage": {
                "knee surgery": ["orthopedic", "surgical", "knee", "joint"],
                "heart surgery": ["cardiac", "cardiovascular", "heart"],
                "cancer treatment": ["oncology", "chemotherapy", "radiation"],
                "diabetes": ["endocrine", "diabetes", "insulin"]
            }
        }
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate retrieved information and make coverage decision"""
        structured_data = input_data.get("structured_data", {})
        relevant_chunks = input_data.get("relevant_chunks", [])
        
        self.log_step(
            action="start_evaluation",
            reasoning="Beginning evaluation of retrieved information",
            output={"chunks_to_evaluate": len(relevant_chunks)}
        )
        
        # Extract key information
        procedure = structured_data.get("procedure", "")
        age = structured_data.get("age")
        policy_duration = structured_data.get("policy_duration", {})
        
        # Analyze coverage
        coverage_analysis = self._analyze_coverage(relevant_chunks, procedure)
        
        # Check for exclusions
        exclusion_analysis = self._check_exclusions(relevant_chunks, structured_data)
        
        # Evaluate policy conditions
        policy_analysis = self._evaluate_policy_conditions(relevant_chunks, structured_data)
        
        # Make final decision
        decision_result = self._make_decision(coverage_analysis, exclusion_analysis, policy_analysis)
        
        # Calculate confidence score
        confidence_score = self._calculate_confidence(coverage_analysis, exclusion_analysis, policy_analysis)
        
        result = {
            "decision": decision_result["decision"],
            "amount": decision_result.get("amount"),
            "justification": decision_result["justification"],
            "confidence_score": confidence_score,
            "analysis": {
                "coverage": coverage_analysis,
                "exclusions": exclusion_analysis,
                "policy_conditions": policy_analysis
            },
            "supporting_evidence": decision_result.get("supporting_evidence", [])
        }
        
        self.log_step(
            action="complete_evaluation",
            reasoning="Completed evaluation and decision making",
            output={
                "decision": result["decision"],
                "confidence": confidence_score
            }
        )
        
        return result
    
    def _analyze_coverage(self, chunks: List[Dict[str, Any]], procedure: str) -> Dict[str, Any]:
        """Analyze if the procedure is covered"""
        coverage_score = 0
        supporting_chunks = []
        
        for chunk in chunks:
            text = chunk.get("text", "").lower()
            
            # Check for general coverage keywords
            coverage_keywords_found = sum(1 for keyword in self.evaluation_rules["coverage_keywords"] if keyword in text)
            
            # Check for procedure-specific coverage
            procedure_score = 0
            if procedure.lower() in self.evaluation_rules["procedure_coverage"]:
                related_keywords = self.evaluation_rules["procedure_coverage"][procedure.lower()]
                procedure_score = sum(1 for keyword in related_keywords if keyword in text)
            
            chunk_score = coverage_keywords_found + procedure_score * 2
            if chunk_score > 0:
                coverage_score += chunk_score * chunk.get("confidence", 0.5)
                supporting_chunks.append({
                    "text": chunk.get("text", "")[:200] + "...",
                    "document": chunk.get("document", ""),
                    "score": chunk_score,
                    "confidence": chunk.get("confidence", 0.5)
                })
        
        return {
            "score": coverage_score,
            "is_covered": coverage_score > 2.0,
            "supporting_chunks": supporting_chunks[:3]  # Top 3
        }
    
    def _check_exclusions(self, chunks: List[Dict[str, Any]], structured_data: Dict[str, Any]) -> Dict[str, Any]:
        """Check for policy exclusions"""
        exclusion_score = 0
        exclusion_reasons = []
        
        age = structured_data.get("age")
        policy_duration = structured_data.get("policy_duration", {})
        
        for chunk in chunks:
            text = chunk.get("text", "").lower()
            
            # Check for exclusion keywords
            exclusions_found = [keyword for keyword in self.evaluation_rules["exclusion_keywords"] if keyword in text]
            
            if exclusions_found:
                exclusion_score += len(exclusions_found) * chunk.get("confidence", 0.5)
                exclusion_reasons.append({
                    "reason": f"Found exclusion terms: {', '.join(exclusions_found)}",
                    "text": chunk.get("text", "")[:200] + "...",
                    "document": chunk.get("document", "")
                })
            
            # Check age-related exclusions
            if age and ("age limit" in text or "maximum age" in text):
                exclusion_score += 1.0
                exclusion_reasons.append({
                    "reason": f"Age-related exclusion may apply (age: {age})",
                    "text": chunk.get("text", "")[:200] + "...",
                    "document": chunk.get("document", "")
                })
            
            # Check waiting period
            if policy_duration and policy_duration.get("unit") == "month" and policy_duration.get("value", 0) < 12:
                if "waiting period" in text or "pre-existing" in text:
                    exclusion_score += 2.0
                    exclusion_reasons.append({
                        "reason": f"Waiting period may apply (policy: {policy_duration['value']} months)",
                        "text": chunk.get("text", "")[:200] + "...",
                        "document": chunk.get("document", "")
                    })
        
        return {
            "score": exclusion_score,
            "has_exclusions": exclusion_score > 1.0,
            "exclusion_reasons": exclusion_reasons[:3]  # Top 3
        }
    
    def _evaluate_policy_conditions(self, chunks: List[Dict[str, Any]], structured_data: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate other policy conditions"""
        conditions = {
            "waiting_period_clear": True,
            "age_eligible": True,
            "location_covered": True,
            "procedure_pre_approved": True
        }
        
        # This would contain more sophisticated logic
        # For now, basic implementation
        
        return {
            "conditions_met": all(conditions.values()),
            "conditions": conditions
        }
    
    def _make_decision(self, coverage_analysis: Dict[str, Any], exclusion_analysis: Dict[str, Any], policy_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Make the final coverage decision"""
        
        is_covered = coverage_analysis.get("is_covered", False)
        has_exclusions = exclusion_analysis.get("has_exclusions", False)
        conditions_met = policy_analysis.get("conditions_met", True)
        
        # Decision logic
        if is_covered and not has_exclusions and conditions_met:
            decision = "approved"
            amount = 50000.0  # This would be calculated based on policy terms
            justification = "Coverage approved based on policy terms and conditions."
        elif is_covered and has_exclusions:
            decision = "requires_more_info"
            amount = None
            justification = "Coverage may be available but exclusions need to be reviewed."
        elif not is_covered:
            decision = "rejected"
            amount = None
            justification = "Procedure not covered under current policy terms."
        else:
            decision = "requires_more_info"
            amount = None
            justification = "Additional information required to make coverage determination."
        
        # Collect supporting evidence
        supporting_evidence = []
        supporting_evidence.extend(coverage_analysis.get("supporting_chunks", []))
        supporting_evidence.extend([{"type": "exclusion", **exc} for exc in exclusion_analysis.get("exclusion_reasons", [])])
        
        return {
            "decision": decision,
            "amount": amount,
            "justification": justification,
            "supporting_evidence": supporting_evidence
        }
    
    def _calculate_confidence(self, coverage_analysis: Dict[str, Any], exclusion_analysis: Dict[str, Any], policy_analysis: Dict[str, Any]) -> float:
        """Calculate confidence score for the decision"""
        coverage_score = min(coverage_analysis.get("score", 0) / 5.0, 1.0)  # Normalize to 0-1
        exclusion_penalty = min(exclusion_analysis.get("score", 0) / 3.0, 0.5)  # Max penalty 0.5
        
        base_confidence = coverage_score - exclusion_penalty
        
        # Boost confidence if we have clear supporting evidence
        if len(coverage_analysis.get("supporting_chunks", [])) > 2:
            base_confidence += 0.1
        
        return max(0.1, min(1.0, base_confidence))  # Clamp between 0.1 and 1.0