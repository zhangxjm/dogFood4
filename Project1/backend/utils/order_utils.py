import uuid
import random
import string
from datetime import datetime


def generate_order_no():
    now = datetime.now()
    random_str = ''.join(random.choices(string.digits, k=6))
    return f"GB{now.strftime('%Y%m%d%H%M%S')}{random_str}"


def generate_verification_code():
    return ''.join(random.choices(string.digits, k=8))


def calculate_commission(pay_amount, rate=0.05):
    return pay_amount * rate
