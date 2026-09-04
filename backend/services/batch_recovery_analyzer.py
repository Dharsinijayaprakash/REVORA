import csv
import json
import os
from collections import defaultdict
from revenue_risk_engine import analyze_transaction
from recovery_decision_engine import decide_recovery_action

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(base_dir, '..', '..', 'data', 'sample', 'transactions.csv')
    output_csv = os.path.join(base_dir, '..', '..', 'data', 'sample', 'recovery_decisions.csv')
    output_json = os.path.join(base_dir, '..', '..', 'data', 'sample', 'recovery_summary.json')

    decisions = []
    
    total_at_risk_transactions = 0
    total_revenue_at_risk = 0
    total_expected_recovery = 0
    action_counts = defaultdict(int)
    expected_recovery_by_action = defaultdict(float)
    human_approval_count = 0
    stopped_count = 0

    with open(input_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            risk_analysis = analyze_transaction(row)
            if risk_analysis['revenue_at_risk'] > 0:
                decision = decide_recovery_action(row, risk_analysis)
                
                # Update statistics
                total_at_risk_transactions += 1
                total_revenue_at_risk += risk_analysis['revenue_at_risk']
                total_expected_recovery += decision['expected_recovery']
                
                action = decision['action']
                action_counts[action] += 1
                expected_recovery_by_action[action] += decision['expected_recovery']
                
                if decision['requires_human_approval']:
                    human_approval_count += 1
                if action == 'STOP':
                    stopped_count += 1
                
                # Combine risk analysis and decision for CSV output
                combined = {
                    'transaction_id': row['transaction_id'],
                    'revenue_at_risk': risk_analysis['revenue_at_risk'],
                    'risk_score': risk_analysis['risk_score'],
                    'risk_level': risk_analysis['risk_level'],
                    'root_cause': risk_analysis['root_cause'],
                    'action': decision['action'],
                    'reason': decision['reason'],
                    'expected_recovery': decision['expected_recovery'],
                    'recovery_probability': decision['recovery_probability'],
                    'intervention_cost': decision['intervention_cost'],
                    'requires_human_approval': decision['requires_human_approval'],
                    'policy_checks': json.dumps(decision['policy_checks']),
                    'stopping_reason': decision['stopping_reason'],
                    'confidence': decision['confidence']
                }
                decisions.append(combined)

    if decisions:
        fieldnames = list(decisions[0].keys())
        with open(output_csv, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(decisions)

    summary = {
        "total_at_risk_transactions": total_at_risk_transactions,
        "total_revenue_at_risk": total_revenue_at_risk,
        "total_expected_recovery": total_expected_recovery,
        "action_counts": dict(action_counts),
        "expected_recovery_by_action": dict(expected_recovery_by_action),
        "human_approval_count": human_approval_count,
        "stopped_count": stopped_count
    }

    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=4)

    print("=" * 40)
    print("RECOVERY BATCH ANALYSIS RESULTS")
    print("=" * 40)
    print(f"Transactions At Risk: {total_at_risk_transactions}")
    print(f"Total Revenue At Risk: INR {total_revenue_at_risk:,.2f}")
    print(f"Total Expected Recovery: INR {total_expected_recovery:,.2f}")
    print("-" * 40)
    print("Action Distribution:")
    for a, c in action_counts.items():
        print(f"  {a}: {c}")
    print("-" * 40)
    print(f"Human Approval Required: {human_approval_count}")
    print(f"Stopped Interventions: {stopped_count}")
    print("=" * 40)

if __name__ == "__main__":
    main()
