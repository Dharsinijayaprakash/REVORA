import csv
import json
import os
from collections import defaultdict
from revenue_risk_engine import analyze_transaction

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(base_dir, '..', '..', 'data', 'sample', 'transactions.csv')
    output_path = os.path.join(base_dir, '..', '..', 'data', 'sample', 'risk_analysis.csv')

    total_transactions = 0
    at_risk_transactions = []
    
    with open(input_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            total_transactions += 1
            result = analyze_transaction(row)
            if result['revenue_at_risk'] > 0:
                at_risk_transactions.append(result)

    total_revenue_at_risk = 0
    level_counts = {'LOW': 0, 'MEDIUM': 0, 'HIGH': 0}
    root_cause_revenue = defaultdict(float)

    for item in at_risk_transactions:
        rev = item['revenue_at_risk']
        total_revenue_at_risk += rev
        level_counts[item['risk_level']] += 1
        root_cause_revenue[item['root_cause']] += rev

    if at_risk_transactions:
        fieldnames = ['transaction_id', 'revenue_at_risk', 'risk_score', 'risk_level', 'root_cause', 'risk_factors', 'recommended_recovery_window']
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for item in at_risk_transactions:
                row_copy = dict(item)
                row_copy['risk_factors'] = json.dumps(row_copy['risk_factors'])
                writer.writerow(row_copy)

    print("=" * 40)
    print("BATCH ANALYSIS RESULTS")
    print("=" * 40)
    print(f"Total Transactions Processed: {total_transactions}")
    print(f"Transactions At Risk: {len(at_risk_transactions)}")
    print(f"Total Revenue At Risk: INR {total_revenue_at_risk:,.2f}")
    print("-" * 40)
    print("Risk Distribution:")
    print(f"  HIGH:   {level_counts['HIGH']}")
    print(f"  MEDIUM: {level_counts['MEDIUM']}")
    print(f"  LOW:    {level_counts['LOW']}")
    print("-" * 40)
    print("Revenue At Risk by Root Cause:")
    for rc, amt in sorted(root_cause_revenue.items(), key=lambda x: x[1], reverse=True):
        print(f"  {rc}: INR {amt:,.2f}")
    print("=" * 40)

if __name__ == "__main__":
    main()
