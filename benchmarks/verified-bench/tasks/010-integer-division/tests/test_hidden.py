import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../workspace"))
from src.index import percentage
def test_half(): assert percentage(1, 2) == 50.0
def test_third(): assert abs(percentage(1, 3) - 33.333) < 0.01
def test_full(): assert percentage(5, 5) == 100.0
