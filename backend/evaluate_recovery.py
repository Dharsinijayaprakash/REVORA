import os
import json
import csv
from services.evaluation_runner import run_evaluation
from services.ai_recovery_agent import AIRecoveryAgent
from services.revenue_risk_engine import analyze_transaction
from services.recovery_decision_engine import decide_recovery_action
from services.policy_guard import validate_action
from services.action_executor import execute_action

from dotenv import load_dotenv

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    load_dotenv(os.path.join(base_dir, '.env'))
    
    input_path = os.path.join(base_dir, '..', 'data', 'sample', 'transactions.csv')
    output_csv = os.path.join(base_dir, '..', 'data', 'sample', 'evaluation_results.csv')
    output_json = os.path.join(base_dir, '..', 'data', 'sample', 'evaluation_summary.json')

    print("\n" + "=" * 50)
    print("BATCH EVALUATION — DETERMINISTIC/SYNTHETIC")
    print("=" * 50)
    
    try:
        summary = run_evaluation(input_path, output_csv, output_json)
        print(f"Total Transactions Processed: {summary['total_transactions']}")
        print(f"Transactions At Risk: {summary['total_at_risk_transactions']}")
        print(f"Total Revenue At Risk: INR {summary['total_revenue_at_risk']:,.2f}")
        print("-" * 50)
        print(f"Total Recovery Attempts: {summary['total_recovery_attempts']}")
        print(f"Successful Recoveries: {summary['successful_recoveries']}")
        print(f"Failed Recoveries: {summary['failed_recoveries']}")
        print(f"Total Amount Recovered: INR {summary['total_amount_recovered']:,.2f}")
        print(f"Remaining Revenue At Risk: INR {summary['remaining_revenue_at_risk']:,.2f}")
        print("-" * 50)
        print(f"Recovery Rate: {summary['recovery_rate']*100:.2f}%")
        print(f"Revenue Recovery Rate: {summary['revenue_recovery_rate']*100:.2f}%")
        print("-" * 50)
        print(f"Expected Recovery (Decision Engine): INR {summary['expected_recovery_from_decision_engine']:,.2f}")
        print(f"Actual Simulated Recovery: INR {summary['actual_simulated_recovery']:,.2f}")
        print(f"Calibration Gap: INR {summary['recovery_calibration_gap']:,.2f}")
        print("-" * 50)
        print("Reconciliation checks PASSED.")
    except Exception as e:
        print(f"Batch evaluation failed: {str(e)}")
        return

    print("\n\n" + "=" * 50)
    print("LIVE AI DEMONSTRATION — GROQ")
    print("=" * 50)
    
    groq_agent = AIRecoveryAgent(provider="groq")
    
    # Select 3-5 representative transactions (e.g. at risk, failed)
    live_cases = []
    with open(input_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['status'] == 'failed' and float(row['amount']) < 50000:
                live_cases.append(row)
            if len(live_cases) >= 3:
                break
                
    for row in live_cases:
        tx_id = row['transaction_id']
        amount = row['amount']
        root_cause = analyze_transaction(row)['root_cause']
        
        print(f"\nTransaction: {tx_id} | Amount: INR {amount} | Root Cause: {root_cause}")
        
        risk_analysis = analyze_transaction(row)
        decision = decide_recovery_action(row, risk_analysis)
        
        print(f"\nDeterministic Baseline Action: {decision['action']}")
        
        ai_recommendation = groq_agent.analyze_recovery_case(row, risk_analysis, decision)
        
        print(f"AI Diagnosis: {ai_recommendation.get('diagnosis', 'N/A')}")
        print(f"AI Recommendation: {ai_recommendation.get('recommended_action', 'N/A')}")
        print(f"AI Confidence: {ai_recommendation.get('confidence', 'N/A')}")
        print(f"AI Reasoning: {ai_recommendation.get('reasoning', 'N/A')}")
        
        policy_result = validate_action(row, ai_recommendation, decision)
        print(f"Policy Guard Approved: {policy_result['approved']}")
        print(f"Final Action: {policy_result['final_action']}")
        
        exec_result = execute_action(row, policy_result)
        print(f"Executor: SUCCESS={exec_result['success']} | {exec_result['message']}")
        print("-" * 50)

if __name__ == "__main__":
    main()
