import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../workspace"))
from src.index import mean
def test_empty_returns_none(): assert mean([]) is None
def test_normal(): assert mean([1,2,3]) == 2.0
def test_single(): assert mean([7]) == 7.0
