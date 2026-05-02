from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    version: str
    project_name: str
