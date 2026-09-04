import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.action_executor import execute_action

def test_action_executor_performs_safe_simulation():
    tx = {"transaction_id": "txn_123"}
    approved_action = {"final_action": "SMART_RETRY"}
    
    res = execute_action(tx, approved_action)
    
    assert res["success"] == True
    assert res["simulated"] == True
    assert "Simulated SMART_RETRY" in res["message"]

def test_action_executor_unknown_action():
    tx = {"transaction_id": "txn_123"}
    approved_action = {"final_action": "SOMETHING_ELSE"}
    
    res = execute_action(tx, approved_action)
    
    assert res["success"] == False
    assert res["simulated"] == True
    assert "Invalid action" in res["message"]
