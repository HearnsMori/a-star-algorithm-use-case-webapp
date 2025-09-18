from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import astar

# Create the FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend's origin here
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

class Node(BaseModel):
    x: int
    y: int

class Path(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int

class PathRequest(BaseModel):
    start_node: Node
    goal_node: Node
    available_path: list[Path]

@app.get("/")
def read_root():
    return {
        "Info": "Hello, this is an A* search algorithm project.",
        "Developer": "Mori, Hearns S.",
        "How to use": "Send a POST request to the /astar/ endpoint with a JSON body."
    }

@app.post("/astar/")
def calculate_path_api(request: PathRequest):
    """
    Calculates the shortest path using the
	A* algorithm based on the provided JSON data.
    """
    solution = astar.find_path(
        start_node=request.start_node.dict(),
        goal_node=request.goal_node.dict(),
        edges=request.available_path
    )
    return {"Movement": solution}
