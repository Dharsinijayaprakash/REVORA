import csv
import json
import os
import math
from collections import defaultdict
from .revenue_risk_engine import analyze_transaction
from .recovery_decision_engine import decide_recovery_action
from .ai_recovery_agent import AIRecoveryAgent
from .policy_guard import validate_action
from .recovery_simulator import simulate_recovery

def run_evaluation(csv_path: str, output_csv_path: str, output_json_path: str):
    agent = AIRecoveryAgent(provider="mock")
    
    results = []
    
    # Aggregates
    total_transactions = 0
    total_at_risk_transactions = 0
    
    # Financial metrics (on at-risk population)
    total_revenue_at_risk = 0.0
    total_recovery_attempts = 0
    successful_recoveries = 0
    failed_recoveries = 0
    total_amount_recovered = 0.0
    remaining_revenue_at_risk = 0.0
    
    human_approval_count = 0
    stopped_count = 0
    policy_override_count = 0
    
    expected_recovery_from_decision_engine = 0.0
    
    action_performance = defaultdict(lambda: {"attempts": 0, "successes": 0, "recovered": 0.0})
    root_cause_performance = defaultdict(lambda: {"attempts": 0, "successes": 0, "recovered": 0.0})

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            total_transactions += 1
            risk_analysis = analyze_transaction(row)
            
            amount = float(row.get('amount', 0))
            is_at_risk = (risk_analysis['revenue_at_risk'] > 0)
            
            if not is_at_risk:
                # Add dummy output for non-at-risk
                results.append({
                    "transaction_id": row['transaction_id'],
                    "amount": amount,
                    "revenue_at_risk": 0.0,
                    "risk_level": risk_analysis['risk_level'],
                    "root_cause": risk_analysis['root_cause'],
                    "deterministic_action": "NONE",
                    "ai_action": "NONE",
                    "final_action": "NONE",
                    "policy_approved": True,
                    "policy_overridden": False,
                    "attempted": False,
                    "success": False,
                    "amount_recovered": 0.0,
                    "remaining_revenue_at_risk": 0.0,
                    "outcome_reason": "No revenue risk"
                })
                continue
                
            # AT RISK path
            total_at_risk_transactions += 1
            total_revenue_at_risk += risk_analysis['revenue_at_risk']
            
            decision = decide_recovery_action(row, risk_analysis)
            expected_recovery_from_decision_engine += decision['expected_recovery']
            
            ai_recommendation = agent.analyze_recovery_case(row, risk_analysis, decision)
            policy_result = validate_action(row, ai_recommendation, decision)
            
            simulation = simulate_recovery(row, decision, policy_result, risk_analysis)
            
            # Metrics aggregation
            total_amount_recovered += simulation['amount_recovered']
            remaining_revenue_at_risk += simulation['remaining_revenue_at_risk']
            
            final_action = policy_result['final_action']
            if final_action == "HUMAN_APPROVAL":
                human_approval_count += 1
            elif final_action == "STOP":
                stopped_count += 1
                
            is_overridden = len(policy_result.get('overrides', [])) > 0
            if is_overridden:
                policy_override_count += 1
                
            if simulation['attempted']:
                total_recovery_attempts += 1
                action_performance[final_action]["attempts"] += 1
                root_cause = risk_analysis['root_cause']
                root_cause_performance[root_cause]["attempts"] += 1
                
                if simulation['success']:
                    successful_recoveries += 1
                    action_performance[final_action]["successes"] += 1
                    action_performance[final_action]["recovered"] += simulation['amount_recovered']
                    root_cause_performance[root_cause]["successes"] += 1
                    root_cause_performance[root_cause]["recovered"] += simulation['amount_recovered']
                else:
                    failed_recoveries += 1
                    
            results.append({
                "transaction_id": row['transaction_id'],
                "amount": amount,
                "revenue_at_risk": risk_analysis['revenue_at_risk'],
                "risk_level": risk_analysis['risk_level'],
                "root_cause": risk_analysis['root_cause'],
                "deterministic_action": decision['action'],
                "ai_action": ai_recommendation.get('recommended_action', 'STOP'),
                "final_action": final_action,
                "policy_approved": policy_result['approved'],
                "policy_overridden": is_overridden,
                "attempted": simulation['attempted'],
                "success": simulation['success'],
                "amount_recovered": simulation['amount_recovered'],
                "remaining_revenue_at_risk": simulation['remaining_revenue_at_risk'],
                "outcome_reason": simulation['outcome_reason']
            })

    # Output CSV
    if results:
        fieldnames = list(results[0].keys())
        with open(output_csv_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(results)

    # Reconciliations
    sum_revenue_at_risk = sum(r['revenue_at_risk'] for r in results)
    
    if not math.isclose(total_revenue_at_risk, sum_revenue_at_risk, abs_tol=0.01):
        raise ValueError(f"Reconciliation Failed: Total revenue at risk ({total_revenue_at_risk}) != Sum of revenue_at_risk ({sum_revenue_at_risk})")
        
    calc_total_risk = total_amount_recovered + remaining_revenue_at_risk
    if not math.isclose(calc_total_risk, total_revenue_at_risk, abs_tol=0.01):
        raise ValueError(f"Reconciliation Failed: Amount recovered + remaining ({calc_total_risk}) != Total revenue at risk ({total_revenue_at_risk})")

    recovery_rate = (successful_recoveries / total_recovery_attempts) if total_recovery_attempts > 0 else 0.0
    revenue_recovery_rate = (total_amount_recovered / total_revenue_at_risk) if total_revenue_at_risk > 0 else 0.0
    recovery_calibration_gap = expected_recovery_from_decision_engine - total_amount_recovered

    summary = {
        "total_transactions": total_transactions,
        "total_at_risk_transactions": total_at_risk_transactions,
        "total_revenue_at_risk": round(total_revenue_at_risk, 2),
        "total_recovery_attempts": total_recovery_attempts,
        "successful_recoveries": successful_recoveries,
        "failed_recoveries": failed_recoveries,
        "total_amount_recovered": round(total_amount_recovered, 2),
        "remaining_revenue_at_risk": round(remaining_revenue_at_risk, 2),
        "recovery_rate": round(recovery_rate, 4),
        "revenue_recovery_rate": round(revenue_recovery_rate, 4),
        "human_approval_count": human_approval_count,
        "stopped_count": stopped_count,
        "policy_override_count": policy_override_count,
        "expected_recovery_from_decision_engine": round(expected_recovery_from_decision_engine, 2),
        "actual_simulated_recovery": round(total_amount_recovered, 2),
        "recovery_calibration_gap": round(recovery_calibration_gap, 2),
        "action_performance": dict(action_performance),
        "root_cause_performance": dict(root_cause_performance)
    }

    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=4)
        
    return summary
