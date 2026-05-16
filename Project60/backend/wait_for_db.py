#!/usr/bin/env python
import time
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'interest_class.settings')
django.setup()

from django.db import connections
from django.db.utils import OperationalError

def wait_for_db():
    print('Waiting for database...')
    max_retries = 30
    retries = 0
    
    while retries < max_retries:
        try:
            conn = connections['default']
            conn.cursor()
            print('Database available!')
            return True
        except OperationalError:
            retries += 1
            print(f'Database unavailable, waiting {retries}...')
            time.sleep(2)
    
    print('Could not connect to database')
    return False

if __name__ == '__main__':
    wait_for_db()
