import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../workspace"))
from src.index import is_even
def test_even(): assert is_even(4) == True
def test_odd(): assert is_even(3) == False
def test_zero(): assert is_even(0) == True
