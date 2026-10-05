from fastapi import FastAPI
from src.utils.db import Base, engine
import src.utils.models  # Register models for Base metadata

Base.metadata.create_all(engine) # means as soon as server starts we try to create with database
app = FastAPI(title="RemindMed!")

# Test Route
@app.get("/")
def root():
    return {"message": "FastAPI is running!"}