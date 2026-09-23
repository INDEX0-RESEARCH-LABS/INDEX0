from index0_agent.core.logger import openhands_logger as logger
from index0_agent.runtime.impl.docker.docker_runtime import (
    DockerRuntime,
)


def get_runtime_cls(name: str):
    # Local imports to avoid circular imports and optional vendor SDK dependencies
    if name == 'eventstream' or name == 'docker':
        return DockerRuntime
    elif name == 'e2b':
        from index0_agent.runtime.impl.e2b.sandbox import E2BBox
        return E2BBox
    elif name == 'remote':
        from index0_agent.runtime.impl.remote.remote_runtime import RemoteRuntime
        return RemoteRuntime
    elif name == 'modal':
        logger.debug('Using ModalRuntime')
        from index0_agent.runtime.impl.modal.modal_runtime import ModalRuntime
        return ModalRuntime
    elif name == 'runloop':
        from index0_agent.runtime.impl.runloop.runloop_runtime import RunloopRuntime
        return RunloopRuntime
    else:
        raise ValueError(f'Runtime {name} not supported')


def __getattr__(name: str):
    if name == 'E2BBox':
        from index0_agent.runtime.impl.e2b.sandbox import E2BBox
        return E2BBox
    elif name == 'RemoteRuntime':
        from index0_agent.runtime.impl.remote.remote_runtime import RemoteRuntime
        return RemoteRuntime
    elif name == 'ModalRuntime':
        from index0_agent.runtime.impl.modal.modal_runtime import ModalRuntime
        return ModalRuntime
    elif name == 'RunloopRuntime':
        from index0_agent.runtime.impl.runloop.runloop_runtime import RunloopRuntime
        return RunloopRuntime
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


__all__ = [
    'E2BBox',
    'RemoteRuntime',
    'ModalRuntime',
    'RunloopRuntime',
    'DockerRuntime',
    'get_runtime_cls',
]

