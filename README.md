# A* Pathfinding Visualization

This project demonstrates an **A*** pathfinding algorithm with:
- **Frontend** (`front/`) built in **Next.js (React + Framer Motion)** for visualization.  
- **Backend** (`back/`) built in **FastAPI (Python)** to compute the A* search path.  

---

## Project Structure
```
root/
webfront/   # Next.js frontend (React + Framer Motion)
back/    # FastAPI backend (Python)
```

---

## Setup & Run

### 1. Clone the repository
```bash
git clone <this-project-copy-the-link-in-top-of-browser>
```

---

### 2. Backend (FastAPI)
Move into the `back` directory and set up Python dependencies:

```bash
cd back
pip install -r requirements.txt
```

Or, if you donâ€™t have a `requirements.txt`, install FastAPI & Uvicorn directly:
```bash
pip install fastapi uvicorn
```

Run the FastAPI server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API will be available at: [http://127.0.0.1:8000/astar](http://127.0.0.1:8000/astar)  
- Small Info available at: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

---

### 3. Frontend (Next.js)
Move into the `front` directory and install dependencies:

```bash
cd ../front
npm install
```

Run the Next.js development server:
```bash
npm run dev
```

By default, Next.js runs on [http://localhost:3000](http://localhost:3000)

---

## How to Use
1. Start **FastAPI backend** (`uvicorn main:app --reload --port 8000`)  
2. Start **Next.js frontend** (`npm run dev`)  
3. Open your browser and go to:  
    [http://localhost:3000](http://localhost:3000)

---

## Notes
- **Frontend** will fetch pathfinding results from the backend API (`http://127.0.0.1:8000/astar/`).  
- Press **Start** to visualize the pathfinding animation.  
- Press **New Random** to generate a new maze.  

---
