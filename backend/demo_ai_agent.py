import os
import csv
import json
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

load_dotenv()

# Safe Diagnostic Output
print("\n--- DIAGNOSTICS ---")
print(f"GROQ_API_KEY loaded: {'GROQ_API_KEY' in os.environ and bool(os.environ['GROQ_API_KEY'])}")
print(f"GROQ_MODEL: {os.environ.get('GROQ_MODEL', 'Not set (defaults to openai/gpt-oss-20b)')}")
import importlib.metadata
try:
    print(f"SDK version (groq): {importlib.metadata.version('groq')}")
except importlib.metadata.PackageNotFoundError:
    print("SDK version (groq): NOT FOUND")
print("-------------------\n")

from services.revenue_risk_engine import analyze_transaction
from services.recovery_decision_engine import decide_recovery_action
from services.ai_recovery_agent import AIRecoveryAgent
from services.policy_guard import validate_action
from services.action_executor import execute_action

def run_demo(provider: str):
    print(f"\n=========================================")
    print(f"REVORA AI RECOVERY DEMO (Provider: {provider.upper()})")
    print(f"=========================================\n")
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(base_dir, '..', 'data', 'sample', 'transactions.csv')
    
    tx = None
    with open(input_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            risk = analyze_transaction(row)
            if risk['revenue_at_risk'] > 0:
                tx = row
                break
                
    if not tx:
        print("No at-risk transactions found.")
        return

    print(f"Transaction: {tx['transaction_id']}")
    print(f"Amount: INR {tx['amount']}")
    
    risk_analysis = analyze_transaction(tx)
    print(f"Root Cause: {risk_analysis['root_cause']}")
    
    det_decision = decide_recovery_action(tx, risk_analysis)
    print(f"\nDeterministic Baseline:")
    print(f"Action: {det_decision['action']}")
    print(f"Reason: {det_decision['reason']}")
    
    agent = AIRecoveryAgent(provider=provider)
    ai_result = agent.analyze_recovery_case(tx, risk_analysis, det_decision)
    
    print(f"\nAI Diagnosis:\n{ai_result['diagnosis']}")
    print(f"\nAI Recommendation:\n{ai_result['recommended_action']}")
    print(f"\nAI Confidence:\n{ai_result['confidence']}")
    print(f"\nAI Reasoning:\n{ai_result['reasoning']}")
    
    guard_result = validate_action(tx, ai_result, det_decision)
    print(f"\nPolicy Guard:")
    print(f"APPROVED: {guard_result['approved']}")
    if not guard_result['approved']:
        print(f"Overrides: {guard_result['overrides']}")
    print(f"Final Action: {guard_result['final_action']}")
        
    exec_result = execute_action(tx, guard_result)
    print(f"\nExecutor:")
    print(f"SUCCESS: {exec_result['success']}")
    print(f"Message: {exec_result['message']}")

if __name__ == "__main__":
    run_demo("mock")
    run_demo("groq")
