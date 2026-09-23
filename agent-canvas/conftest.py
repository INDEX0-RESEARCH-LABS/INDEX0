"""Global pytest configuration ensuring openhands.* imports map to index0_agent.* seamlessly."""
import sys
import importlib

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
