import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../workspace"))
from src.index import find_max
def test_normal(): assert find_max([3,1,4,1,5,9,2,6]) == 9
def test_single(): assert find_max([7]) == 7
def test_large(): assert find_max(list(range(2000))) == 1999
