from abc import ABC, abstractmethod
from typing import Dict, Any, List
from ..models.schemas import AgentStep

class BaseAgent(ABC):
    """Abstract base class for all agents in the multi-agent system"""
    
    def __init__(self, name: str):
        self.name = name
        self.steps: List[AgentStep] = []
    
    @abstractmethod
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process input data and return output"""
        pass
    
    def log_step(self, action: str, reasoning: str, output: Dict[str, Any]):
        """Log an agent step for traceability"""
        step = AgentStep(
            agent_name=self.name,
            action=action,
            reasoning=reasoning,
            output=output
        )
        self.steps.append(step)
    
    def get_steps(self) -> List[AgentStep]:
        """Get all logged steps"""
        return self.steps
    
    def reset_steps(self):
        """Reset logged steps"""
        self.steps = []