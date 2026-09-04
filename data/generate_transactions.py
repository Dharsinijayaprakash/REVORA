import csv
import random
from datetime import datetime, timedelta
import uuid

# Fixed seed for deterministic generation
random.seed(42)

NUM_RECORDS = 5000

# Distribution of statuses (approximate based on requirements)
# 60% successful, 15% failed, 10% abandoned, 15% overdue
status_weights = {
    'successful': 0.60,
    'failed': 0.15,
    'abandoned': 0.10,
    'overdue': 0.15
}
statuses = list(status_weights.keys())
weights = list(status_weights.values())

failure_reasons_for_failed = [
    'temporary_bank_error', 'card_declined', 'insufficient_funds', 
    'authentication_failure', 'network_error', 'unknown'
]

customer_pool = [f"cust_{i:04d}" for i in range(1, 1001)]

def random_date(start_days_ago=180):
    now = datetime.now()
    delta = timedelta(days=random.randint(0, start_days_ago), 
                      hours=random.randint(0, 23), 
                      minutes=random.randint(0, 59))
    return (now - delta).strftime("%Y-%m-%d %H:%M:%S")

data = []

total_value = 0
revenue_at_risk = 0
status_counts = {'successful': 0, 'failed': 0, 'abandoned': 0, 'overdue': 0}

for i in range(NUM_RECORDS):
    # Determine Status
    status = random.choices(statuses, weights=weights)[0]
    status_counts[status] += 1
    
    # Amount
    amount = random.randint(100, 50000)
    total_value += amount
    
    # Transaction Type & Failure Reason based on Status
    if status == 'successful':
        transaction_type = random.choice(['payment', 'subscription', 'checkout', 'invoice'])
        failure_reason = 'none'
        recovered = True
        recovered_amount = amount
        invoice_due_days = 0
    elif status == 'failed':
        transaction_type = random.choice(['payment', 'subscription'])
        failure_reason = random.choice(failure_reasons_for_failed)
        recovered = False
        recovered_amount = 0
        invoice_due_days = 0
    elif status == 'abandoned':
        transaction_type = 'checkout'
        failure_reason = 'none'
        recovered = False
        recovered_amount = 0
        invoice_due_days = 0
    elif status == 'overdue':
        transaction_type = 'invoice'
        failure_reason = 'none'
        recovered = False
        recovered_amount = 0
        invoice_due_days = random.randint(1, 90)

    if not recovered:
        revenue_at_risk += amount

    # Subscription Status
    if transaction_type == 'subscription':
        if status == 'successful':
            subscription_status = 'active'
        elif status == 'failed':
            subscription_status = random.choice(['past_due', 'canceled'])
        else:
            subscription_status = 'none'
    else:
        subscription_status = 'none'

    # Customer info
    customer_id = random.choice(customer_pool)
    customer_type = random.choice(['new', 'returning', 'VIP'])
    
    # Previous history
    if customer_type == 'new':
        prev_success = random.randint(0, 1)
        prev_failed = 0
    elif customer_type == 'returning':
        prev_success = random.randint(1, 20)
        prev_failed = random.randint(0, 3)
    else:
        prev_success = random.randint(20, 100)
        prev_failed = random.randint(0, 5)
        
    clv = amount + (prev_success * random.randint(500, 5000))
    checkout_abandoned = (status == 'abandoned') or (random.random() < 0.05)
    
    record = {
        'transaction_id': f"txn_{uuid.uuid4().hex[:8]}",
        'customer_id': customer_id,
        'amount': amount,
        'currency': 'INR',
        'transaction_date': random_date(),
        'transaction_type': transaction_type,
        'status': status,
        'failure_reason': failure_reason,
        'customer_type': customer_type,
        'previous_successful_payments': prev_success,
        'previous_failed_payments': prev_failed,
        'checkout_abandoned': checkout_abandoned,
        'subscription_status': subscription_status,
        'invoice_due_days': invoice_due_days,
        'customer_lifetime_value': clv,
        'recovery_attempts': 0,
        'recovered': recovered,
        'recovered_amount': recovered_amount
    }
    data.append(record)

csv_path = 'sample/transactions.csv'
fieldnames = list(data[0].keys())

with open(csv_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(data)

# Validation & Printing
print(f"Dataset generated successfully at {csv_path}")
print("-" * 30)
print(f"Total Transactions: {NUM_RECORDS}")
print(f"Successful Count: {status_counts['successful']}")
print(f"Failed Count: {status_counts['failed']}")
print(f"Abandoned Count: {status_counts['abandoned']}")
print(f"Overdue Count: {status_counts['overdue']}")
print("-" * 30)
print(f"Total Transaction Value: INR {total_value:,.2f}")
print(f"Total Revenue Currently At Risk: INR {revenue_at_risk:,.2f}")
print("-" * 30)

# Verify no missing required fields
missing_fields = sum(1 for row in data if not all(str(val) != '' and val is not None for val in row.values()))
print(f"Records with missing fields: {missing_fields}")
