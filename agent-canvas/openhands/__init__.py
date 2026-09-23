"""Backward-compatibility alias module redirecting OpenHands imports to index0_agent."""
import sys
import importlib
import index0_agent

__package_name__ = 'index0-agent'
__version__ = getattr(index0_agent, '__version__', '1.0.0')

class _OpenHandsRedirector:
    def find_spec(self, fullname, path, target=None):
        if fullname == 'openhands' or fullname.startswith('openhands.'):
            target_name = 'index0_agent' + fullname[len('openhands'):]
            try:
                target_module = importlib.import_module(target_name)
                sys.modules[fullname] = target_module
                return target_module.__spec__
            except Exception:
                return None
        return None

if not any(isinstance(finder, _OpenHandsRedirector) for finder in sys.meta_path):
    sys.meta_path.insert(0, _OpenHandsRedirector())

def __getattr__(name):
    return getattr(index0_agent, name)

sys.modules['openhands'] = index0_agent
