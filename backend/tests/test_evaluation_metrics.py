import pytest
import csv
import json
import os
import tempfile
from services.evaluation_runner import run_evaluation

def test_evaluation_metrics_calculations():
    # Create a dummy CSV
    with tempfile.TemporaryDirectory() as tmpdir:
        input_csv = os.path.join(tmpdir, "test_input.csv")
        output_csv = os.path.join(tmpdir, "test_output.csv")
        output_json = os.path.join(tmpdir, "test_output.json")
        
        # We need a transaction that will definitely trigger a recovery attempt
        # To guarantee success or failure, we'd normally mock, but we can just use 
        # a known transaction that acts deterministically based on seed
        
        # We'll put 1 transaction that is not recovered
        with open(input_csv, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(["transaction_id", "amount", "recovered", "recovered_amount", "status", "failure_reason", "checkout_abandoned", "recovery_attempts", "invoice_due_days", "previous_failed_payments"])
            # row that is at risk (recovered=False), amount=100
            writer.writerow(["txn_123", "100", "False", "0", "failed", "card_declined", "False", "0", "0", "0"])
            # row that is NOT at risk (recovered=True), amount=200
            writer.writerow(["txn_456", "200", "True", "200", "successful", "none", "False", "0", "0", "0"])
            
        summary = run_evaluation(input_csv, output_csv, output_json)
        
        assert summary["total_transactions"] == 2
        assert summary["total_at_risk_transactions"] == 1
        assert summary["total_revenue_at_risk"] == 100.0
        
        # Check formulas 
        expected_rr = (summary["successful_recoveries"] / summary["total_recovery_attempts"]) if summary["total_recovery_attempts"] > 0 else 0.0
        assert summary["recovery_rate"] == round(expected_rr, 4)
        
        expected_rrr = (summary["total_amount_recovered"] / summary["total_revenue_at_risk"]) if summary["total_revenue_at_risk"] > 0 else 0.0
        assert summary["revenue_recovery_rate"] == round(expected_rrr, 4)
        
        expected_gap = summary["expected_recovery_from_decision_engine"] - summary["actual_simulated_recovery"]
        assert summary["recovery_calibration_gap"] == round(expected_gap, 2)
        
        # Assert reconciliation passed (implied if no exception raised)
        # Verify CSV has 2 rows
        with open(output_csv, 'r', encoding='utf-8') as f:
            lines = list(csv.DictReader(f))
            assert len(lines) == 2
            # Verify the non-at-risk row is zeroed out correctly
            non_risk_row = next(r for r in lines if r["transaction_id"] == "txn_456")
            assert float(non_risk_row["revenue_at_risk"]) == 0.0
            assert non_risk_row["attempted"] == "False"
            assert float(non_risk_row["amount_recovered"]) == 0.0
