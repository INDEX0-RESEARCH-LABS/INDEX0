"""Backward-compatibility alias module redirecting OpenHands imports to index0_agent."""
import sys
import index0_agent

__package_name__ = 'index0-agent'
__version__ = getattr(index0_agent, '__version__', '1.0.0')

def __getattr__(name):
    return getattr(index0_agent, name)
