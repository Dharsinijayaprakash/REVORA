import os
import json
import logging
from pydantic import BaseModel, Field
from groq import Groq

logger = logging.getLogger("REVORA.AIRecoveryAgent")

class AIRecommendation(BaseModel):
    diagnosis: str
    recommended_action: str = Field(description="Must be SMART_RETRY, PAYMENT_REMINDER, MANDATE_RETRY, RECEIVABLES_ESCALATION, HUMAN_APPROVAL, or STOP")
    reasoning: str
    customer_message: str
    confidence: float
    alternative_action: str
    expected_outcome: str
    requires_policy_validation: bool

class AIRecoveryAgent:
    ALLOWED_ACTIONS = {
        "SMART_RETRY", "PAYMENT_REMINDER", "MANDATE_RETRY",
        "RECEIVABLES_ESCALATION", "HUMAN_APPROVAL", "STOP"
    }

    def __init__(self, provider: str = "mock"):
        self.provider = provider

    def analyze_recovery_case(self, transaction: dict, risk_analysis: dict, deterministic_decision: dict) -> dict:
        if self.provider == "groq":
            return self._analyze_with_groq(transaction, risk_analysis, deterministic_decision)
        return self._analyze_with_mock(transaction, risk_analysis, deterministic_decision)

    def _fallback_response(self, deterministic_decision: dict, reason: str) -> dict:
        action = deterministic_decision.get("action", "STOP")
        if action not in self.ALLOWED_ACTIONS:
            action = "STOP"
        return {
            "diagnosis": f"AI provider failure: {reason}",
            "recommended_action": action,
            "reasoning": f"Fallback to deterministic baseline due to AI failure. Baseline reason: {deterministic_decision.get('reason', '')}",
            "customer_message": "",
            "confidence": deterministic_decision.get("confidence", 50.0),
            "alternative_action": "STOP",
            "expected_outcome": "Unknown (Fallback)",
            "requires_policy_validation": True
        }

    def _analyze_with_groq(self, transaction: dict, risk_analysis: dict, deterministic_decision: dict) -> dict:
        api_key = os.environ.get("GROQ_API_KEY")
        model = os.environ.get("GROQ_MODEL", "openai/gpt-oss-20b")

        if not api_key:
            logger.error("GROQ_API_KEY not found in environment.")
            return self._fallback_response(deterministic_decision, "API Key Missing")

        system_instruction = """You are REVORA, an AI Revenue Recovery decision-support agent.
Your job is to analyze revenue-at-risk cases and recommend a bounded recovery action.
You are NOT authorized to move money.
You are NOT authorized to:
- transfer money
- refund money
- modify transaction amounts
- modify payment credentials
- bypass merchant policies
- bypass human approval
- invent financial actions
You may recommend ONLY:
SMART_RETRY
PAYMENT_REMINDER
MANDATE_RETRY
RECEIVABLES_ESCALATION
HUMAN_APPROVAL
STOP

A deterministic recovery engine has already analyzed the case.
Treat its output as the baseline recommendation.
You may provide reasoning and supporting analysis, but you MUST NOT recommend an action that violates supplied policy constraints.
High-value transactions require human approval.
Transactions that have reached maximum recovery attempts must stop.
Severely overdue invoices require human approval.
If uncertain, prefer the safer action or STOP.
Use only facts provided in the transaction and risk-analysis data.
Never invent customer information.
Never claim that money was recovered unless the executor reports successful recovery.
Return only the required structured JSON.
"""

        prompt = f"""
Transaction Data:
{json.dumps(transaction, indent=2)}

Risk Analysis:
{json.dumps(risk_analysis, indent=2)}

Deterministic Baseline Decision:
{json.dumps(deterministic_decision, indent=2)}

Based on the rules provided, recommend an action and generate a customer message if applicable.
"""

        try:
            client = Groq(api_key=api_key)
            
            # Using structured outputs with JSON Schema capability
            schema = AIRecommendation.model_json_schema()
            
            def enforce_strict_schema(s):
                if isinstance(s, dict):
                    if s.get("type") == "object" or "properties" in s:
                        s["additionalProperties"] = False
                        if "properties" in s:
                            s["required"] = list(s["properties"].keys())
                    for key, value in s.items():
                        enforce_strict_schema(value)
                elif isinstance(s, list):
                    for item in s:
                        enforce_strict_schema(item)
            
            enforce_strict_schema(schema)
            
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt}
                ],
                temperature=0,
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "AIRecommendation",
                        "schema": schema,
                        "strict": True
                    }
                }
            )

            # Validate response
            text_response = response.choices[0].message.content
            parsed_data = AIRecommendation.model_validate_json(text_response)
            result = parsed_data.model_dump()
            
            # Additional safety validations (Action constraints)
            if result["recommended_action"] not in self.ALLOWED_ACTIONS:
                logger.error(f"Invalid action returned by LLM: {result['recommended_action']}")
                return self._fallback_response(deterministic_decision, "Invalid Action Returned")
                
            # Confidence bounds
            if not (0 <= result["confidence"] <= 100):
                logger.error(f"Invalid confidence returned by LLM: {result['confidence']}")
                return self._fallback_response(deterministic_decision, "Invalid Confidence Returned")

            logger.info(f"Groq API call successful for transaction {transaction.get('transaction_id')}")
            return result

        except Exception as e:
            logger.error(f"Groq API failed for transaction {transaction.get('transaction_id')}: {str(e)}")
            return self._fallback_response(deterministic_decision, str(e))

    def _analyze_with_mock(self, transaction: dict, risk_analysis: dict, deterministic_decision: dict) -> dict:
        base_action = deterministic_decision.get("action", "STOP")
        
        if base_action not in self.ALLOWED_ACTIONS:
            base_action = "STOP"
            
        diagnosis = f"Mock diagnosis: {risk_analysis.get('root_cause', 'Unknown')} detected."
        reasoning = f"Mock reasoning: Aligning with deterministic baseline of {base_action}."
        
        if base_action == "HUMAN_APPROVAL":
            customer_message = ""
        elif base_action == "PAYMENT_REMINDER":
            customer_message = f"Hi, there was an issue with your payment of {transaction.get('amount')}. Please update your payment method."
        else:
            customer_message = "Automated retry in progress."
            
        return {
            "diagnosis": diagnosis,
            "recommended_action": base_action,
            "reasoning": reasoning,
            "customer_message": customer_message,
            "confidence": deterministic_decision.get("confidence", 50.0),
            "alternative_action": "HUMAN_APPROVAL" if base_action != "HUMAN_APPROVAL" else "STOP",
            "expected_outcome": "Recovery expected" if base_action != "STOP" else "No recovery",
            "requires_policy_validation": True
        }
