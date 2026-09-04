import sys
import os
import json
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from services.ai_recovery_agent import AIRecoveryAgent

def test_mock_provider_works():
    agent = AIRecoveryAgent(provider="mock")
    tx = {"transaction_id": "1", "amount": 1000}
    risk = {"root_cause": "TEMPORARY_PAYMENT_FAILURE"}
    det = {"action": "SMART_RETRY", "confidence": 85.0}
    res = agent.analyze_recovery_case(tx, risk, det)
    assert res["recommended_action"] == "SMART_RETRY"
    assert "Mock diagnosis" in res["diagnosis"]

@patch("services.ai_recovery_agent.Groq")
@patch.dict(os.environ, {"GROQ_API_KEY": "fake_key"})
def test_groq_valid_response(mock_groq_class):
    mock_client = mock_groq_class.return_value
    mock_completion = MagicMock()
    valid_json = {
        "diagnosis": "A test diagnosis",
        "recommended_action": "PAYMENT_REMINDER",
        "reasoning": "A test reason",
        "customer_message": "Please pay",
        "confidence": 90.0,
        "alternative_action": "STOP",
        "expected_outcome": "Payment",
        "requires_policy_validation": True
    }
    
    mock_message = MagicMock()
    mock_message.content = json.dumps(valid_json)
    mock_choice = MagicMock()
    mock_choice.message = mock_message
    mock_completion.choices = [mock_choice]
    
    mock_client.chat.completions.create.return_value = mock_completion

    agent = AIRecoveryAgent(provider="groq")
    tx = {"transaction_id": "1", "amount": 1000}
    res = agent.analyze_recovery_case(tx, {}, {"action": "PAYMENT_REMINDER"})
    
    assert res["recommended_action"] == "PAYMENT_REMINDER"
    assert res["diagnosis"] == "A test diagnosis"

@patch("services.ai_recovery_agent.Groq")
@patch.dict(os.environ, {"GROQ_API_KEY": "fake_key"})
def test_groq_invalid_json(mock_groq_class):
    mock_client = mock_groq_class.return_value
    mock_completion = MagicMock()
    
    mock_message = MagicMock()
    mock_message.content = "NOT JSON"
    mock_choice = MagicMock()
    mock_choice.message = mock_message
    mock_completion.choices = [mock_choice]
    
    mock_client.chat.completions.create.return_value = mock_completion

    agent = AIRecoveryAgent(provider="groq")
    tx = {"transaction_id": "1"}
    det = {"action": "SMART_RETRY"}
    res = agent.analyze_recovery_case(tx, {}, det)
    
    assert "AI provider failure" in res["diagnosis"]
    assert res["recommended_action"] == "SMART_RETRY"

@patch("services.ai_recovery_agent.Groq")
@patch.dict(os.environ, {"GROQ_API_KEY": "fake_key"})
def test_groq_invalid_action(mock_groq_class):
    mock_client = mock_groq_class.return_value
    mock_completion = MagicMock()
    invalid_action_json = {
        "diagnosis": "A test diagnosis",
        "recommended_action": "REFUND", # INVALID
        "reasoning": "A test reason",
        "customer_message": "Please pay",
        "confidence": 90.0,
        "alternative_action": "STOP",
        "expected_outcome": "Payment",
        "requires_policy_validation": True
    }
    
    mock_message = MagicMock()
    mock_message.content = json.dumps(invalid_action_json)
    mock_choice = MagicMock()
    mock_choice.message = mock_message
    mock_completion.choices = [mock_choice]
    
    mock_client.chat.completions.create.return_value = mock_completion

    agent = AIRecoveryAgent(provider="groq")
    tx = {"transaction_id": "1"}
    det = {"action": "SMART_RETRY"}
    res = agent.analyze_recovery_case(tx, {}, det)
    
    assert "AI provider failure" in res["diagnosis"]
    assert res["recommended_action"] == "SMART_RETRY"

@patch("services.ai_recovery_agent.Groq")
@patch.dict(os.environ, {"GROQ_API_KEY": "fake_key"})
def test_groq_high_confidence(mock_groq_class):
    mock_client = mock_groq_class.return_value
    mock_completion = MagicMock()
    invalid_json = {
        "diagnosis": "A test diagnosis",
        "recommended_action": "SMART_RETRY",
        "reasoning": "A test reason",
        "customer_message": "Please pay",
        "confidence": 150.0, # INVALID
        "alternative_action": "STOP",
        "expected_outcome": "Payment",
        "requires_policy_validation": True
    }
    
    mock_message = MagicMock()
    mock_message.content = json.dumps(invalid_json)
    mock_choice = MagicMock()
    mock_choice.message = mock_message
    mock_completion.choices = [mock_choice]
    
    mock_client.chat.completions.create.return_value = mock_completion

    agent = AIRecoveryAgent(provider="groq")
    tx = {"transaction_id": "1"}
    det = {"action": "STOP"}
    res = agent.analyze_recovery_case(tx, {}, det)
    
    assert "AI provider failure" in res["diagnosis"]
    assert res["recommended_action"] == "STOP"

@patch("services.ai_recovery_agent.Groq")
@patch.dict(os.environ, {"GROQ_API_KEY": "fake_key"})
def test_groq_low_confidence(mock_groq_class):
    mock_client = mock_groq_class.return_value
    mock_completion = MagicMock()
    invalid_json = {
        "diagnosis": "A test diagnosis",
        "recommended_action": "SMART_RETRY",
        "reasoning": "A test reason",
        "customer_message": "Please pay",
        "confidence": -10.0, # INVALID
        "alternative_action": "STOP",
        "expected_outcome": "Payment",
        "requires_policy_validation": True
    }
    
    mock_message = MagicMock()
    mock_message.content = json.dumps(invalid_json)
    mock_choice = MagicMock()
    mock_choice.message = mock_message
    mock_completion.choices = [mock_choice]
    
    mock_client.chat.completions.create.return_value = mock_completion

    agent = AIRecoveryAgent(provider="groq")
    tx = {"transaction_id": "1"}
    det = {"action": "STOP"}
    res = agent.analyze_recovery_case(tx, {}, det)
    
    assert "AI provider failure" in res["diagnosis"]
    assert res["recommended_action"] == "STOP"

@patch("services.ai_recovery_agent.Groq")
@patch.dict(os.environ, {"GROQ_API_KEY": "fake_key"})
def test_groq_api_failure(mock_groq_class):
    mock_client = mock_groq_class.return_value
    mock_client.chat.completions.create.side_effect = Exception("API Timeout")

    agent = AIRecoveryAgent(provider="groq")
    tx = {"transaction_id": "1"}
    det = {"action": "PAYMENT_REMINDER"}
    res = agent.analyze_recovery_case(tx, {}, det)
    
    assert "AI provider failure" in res["diagnosis"]
    assert "API Timeout" in res["diagnosis"]
    assert res["recommended_action"] == "PAYMENT_REMINDER"

def test_api_key_not_exposed():
    agent = AIRecoveryAgent(provider="groq")
    tx = {"transaction_id": "1"}
    det = {"action": "STOP"}
    res = agent.analyze_recovery_case(tx, {}, det)
    
    res_str = json.dumps(res)
    assert "GROQ_API_KEY" not in res_str
    
@patch("services.ai_recovery_agent.Groq")
@patch.dict(os.environ, {"GROQ_API_KEY": "fake_key"})
def test_customer_message_present(mock_groq_class):
    mock_client = mock_groq_class.return_value
    mock_completion = MagicMock()
    valid_json = {
        "diagnosis": "Diag",
        "recommended_action": "PAYMENT_REMINDER",
        "reasoning": "Res",
        "customer_message": "Hello customer",
        "confidence": 90.0,
        "alternative_action": "STOP",
        "expected_outcome": "Payment",
        "requires_policy_validation": True
    }
    
    mock_message = MagicMock()
    mock_message.content = json.dumps(valid_json)
    mock_choice = MagicMock()
    mock_choice.message = mock_message
    mock_completion.choices = [mock_choice]
    
    mock_client.chat.completions.create.return_value = mock_completion

    agent = AIRecoveryAgent(provider="groq")
    res = agent.analyze_recovery_case({"transaction_id": "1"}, {}, {"action": "STOP"})
    assert res["customer_message"] == "Hello customer"

from services.policy_guard import validate_action
def test_ai_output_compatible_with_guard():
    agent = AIRecoveryAgent(provider="mock")
    tx = {"transaction_id": "1", "amount": 1000}
    det = {"action": "SMART_RETRY", "expected_recovery": 750, "confidence": 85.0}
    ai_res = agent.analyze_recovery_case(tx, {}, det)
    
    guard_res = validate_action(tx, ai_res, det)
    assert guard_res["approved"] == True
