import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../workspace"))
from src.index import double_list
def test_doubles(): assert double_list([1,2,3]) == [2,4,6]
def test_empty(): assert double_list([]) == []
def test_single(): assert double_list([5]) == [10]
