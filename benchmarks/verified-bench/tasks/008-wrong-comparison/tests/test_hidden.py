import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../workspace"))
from src.index import clamp
def test_below(): assert clamp(1, 5, 10) == 5
def test_above(): assert clamp(15, 5, 10) == 10
def test_inside(): assert clamp(7, 5, 10) == 7
