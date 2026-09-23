from index0_agent.storage.files import FileStore
from index0_agent.storage.local import LocalFileStore
from index0_agent.storage.memory import InMemoryFileStore


def get_file_store(file_store: str, file_store_path: str | None = None) -> FileStore:
    if file_store == 'local':
        if file_store_path is None:
            raise ValueError('file_store_path is required for local file store')
        return LocalFileStore(file_store_path)
    elif file_store == 's3':
        from index0_agent.storage.s3 import S3FileStore
        return S3FileStore()
    elif file_store == 'google_cloud':
        from index0_agent.storage.google_cloud import GoogleCloudFileStore
        return GoogleCloudFileStore(file_store_path)
    return InMemoryFileStore()
