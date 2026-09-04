# Synthetic Revenue Dataset

This dataset is **synthetic** and generated deterministically for demonstration purposes. **No real customer or payment data is used.**

## Overview
- **Intended Use**: Hackathon demonstration, evaluation, and testing for the REVORA AI Revenue Recovery Agent.
- **Number of Records**: 5,000

## Field Descriptions
- `transaction_id`: Unique identifier for the transaction.
- `customer_id`: Unique identifier for the customer.
- `amount`: Transaction amount in INR.
- `currency`: Currency of the transaction (INR).
- `transaction_date`: The date and time the transaction occurred.
- `transaction_type`: Type of transaction (`payment`, `subscription`, `checkout`, `invoice`).
- `status`: Current status of the transaction (`successful`, `failed`, `abandoned`, `overdue`).
- `failure_reason`: Reason for failure, if applicable (e.g., `card_declined`, `insufficient_funds`).
- `customer_type`: Category of the customer (`new`, `returning`, `VIP`).
- `previous_successful_payments`: Count of past successful payments by the customer.
- `previous_failed_payments`: Count of past failed payments by the customer.
- `checkout_abandoned`: Boolean indicating if a checkout was abandoned.
- `subscription_status`: Current status of the subscription, if applicable.
- `invoice_due_days`: Number of days an invoice is overdue (0 if not overdue).
- `customer_lifetime_value`: Estimated lifetime value of the customer.
- `recovery_attempts`: Number of AI interventions attempted (starts at 0).
- `recovered`: Boolean indicating whether revenue at risk was recovered.
- `recovered_amount`: Amount successfully recovered.
