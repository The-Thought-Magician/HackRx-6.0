import re
from typing import Dict, Any
from .base_agent import BaseAgent

class QueryParserAgent(BaseAgent):
    """Agent responsible for parsing and structuring natural language queries"""
    
    def __init__(self):
        super().__init__("QueryParserAgent")
        
        # Define patterns for extracting structured information
        self.patterns = {
            "age": r"(\d{1,3})[-\s]*(year|yr|y)[-\s]*old|(\d{1,3})[MF]|(\d{1,3})[-\s]*male|(\d{1,3})[-\s]*female",
            "gender": r"(male|female|man|woman|M|F)",
            "procedure": r"(surgery|operation|treatment|procedure|therapy)",
            "location": r"(in\s+)?([A-Z][a-zA-Z\s]+(?:,\s*[A-Z][a-zA-Z\s]*)*)",
            "policy_duration": r"(\d+)[-\s]*(month|year|day)[-\s]*(old\s+)?policy"
        }
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse the query and extract structured information"""
        query = input_data.get("query", "")
        
        self.log_step(
            action="parse_query",
            reasoning="Extracting structured information from natural language query",
            output={"query": query}
        )
        
        parsed_data = {
            "original_query": query,
            "structured_data": {}
        }
        
        # Extract age
        age_match = re.search(self.patterns["age"], query, re.IGNORECASE)
        if age_match:
            age = None
            for group in age_match.groups():
                if group and group.isdigit():
                    age = int(group)
                    break
            if age:
                parsed_data["structured_data"]["age"] = age
        
        # Extract gender
        gender_match = re.search(self.patterns["gender"], query, re.IGNORECASE)
        if gender_match:
            gender = gender_match.group(1).lower()
            if gender in ['m', 'male', 'man']:
                parsed_data["structured_data"]["gender"] = "male"
            elif gender in ['f', 'female', 'woman']:
                parsed_data["structured_data"]["gender"] = "female"
        
        # Extract procedure/condition
        procedure_keywords = [
            "knee surgery", "heart surgery", "surgery", "operation", 
            "treatment", "therapy", "procedure", "knee", "heart", 
            "cancer", "diabetes", "hypertension"
        ]
        
        found_procedures = []
        for keyword in procedure_keywords:
            if keyword.lower() in query.lower():
                found_procedures.append(keyword)
        
        if found_procedures:
            parsed_data["structured_data"]["procedure"] = found_procedures[0]
        
        # Extract location
        location_match = re.search(self.patterns["location"], query, re.IGNORECASE)
        if location_match and location_match.group(2):
            location = location_match.group(2).strip()
            # Filter out common non-location words
            non_locations = ["surgery", "treatment", "policy", "male", "female", "year", "month"]
            if not any(nl in location.lower() for nl in non_locations):
                parsed_data["structured_data"]["location"] = location
        
        # Extract policy duration
        policy_match = re.search(self.patterns["policy_duration"], query, re.IGNORECASE)
        if policy_match:
            duration = int(policy_match.group(1))
            unit = policy_match.group(2).lower()
            parsed_data["structured_data"]["policy_duration"] = {
                "value": duration,
                "unit": unit
            }
        
        # Generate search keywords
        search_keywords = []
        structured = parsed_data["structured_data"]
        
        if "procedure" in structured:
            search_keywords.append(structured["procedure"])
        if "location" in structured:
            search_keywords.append(structured["location"])
        if "age" in structured:
            search_keywords.append(f"age {structured['age']}")
        if "policy_duration" in structured:
            duration = structured["policy_duration"]
            search_keywords.append(f"{duration['value']} {duration['unit']} policy")
        
        parsed_data["search_keywords"] = search_keywords
        parsed_data["search_query"] = " ".join(search_keywords) if search_keywords else query
        
        self.log_step(
            action="extract_structured_data",
            reasoning="Successfully extracted structured information from query",
            output=parsed_data
        )
        
        return parsed_data