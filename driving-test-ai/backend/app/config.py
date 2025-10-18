# backend/app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GCP_PROJECT_ID: str = "bgn-ie-hack25dub-707"
    GCP_LOCATION: str = "us-central1"
    IMAGES_PATH: str = "./data/scenario_images"
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # THIS FIXES THE ERROR!

settings = Settings()