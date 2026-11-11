import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../workspace"))
from src.index import range_sum
def test_includes_n(): assert range_sum(5) == 15
def test_zero(): assert range_sum(0) == 0
def test_one(): assert range_sum(1) == 1
