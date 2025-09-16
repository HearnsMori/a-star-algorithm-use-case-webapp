import heapq

class Node:
    # A simplified Node class for A*
    def __init__(self, parent=None, position=None):
        self.parent = parent
        self.position = position
        self.g = 0
        self.h = 0
        self.f = 0
    
    def __eq__(self, other):
        return self.position == other.position
    
    def __lt__(self, other):
        return self.f < other.f

def build_graph(available_paths: list):
    """
    Builds an adjacency list representation of a graph from available paths.
    """
    graph = {}
    
    for path in available_paths:
        # CORRECT: Use dot notation to access attributes
        start_node = (path.x1, path.y1)
        end_node = (path.x2, path.y2)
        
        if start_node not in graph:
            graph[start_node] = []
        if end_node not in graph:
            graph[end_node] = []
        
        graph[start_node].append(end_node)
        graph[end_node].append(start_node)
    
    return graph

def astar_search(graph, start, end):
    # A* search algorithm implementation
    start_node = Node(None, start)
    end_node = Node(None, end)
    
    # ... (the rest of the astar_search function remains the same) ...

    open_list = []
    closed_list = set()

    heapq.heappush(open_list, (start_node.f, start_node))

    while open_list:
        f_val, current_node = heapq.heappop(open_list)
        closed_list.add(current_node.position)

        if current_node.position == end_node.position:
            path = []
            current = current_node
            while current is not None:
                path.append(current.position)
                current = current.parent
            return path[::-1]

        neighbors = graph.get(current_node.position, [])

        for neighbor_pos in neighbors:
            if neighbor_pos in closed_list:
                continue
            
            new_node = Node(current_node, neighbor_pos)
            
            new_node.g = current_node.g + 1
            new_node.h = abs(new_node.position[0] - end_node.position[0]) + \
                         abs(new_node.position[1] - end_node.position[1])
            new_node.f = new_node.g + new_node.h
            
            in_open = any(open_node.position == new_node.position and open_node.g <= new_node.g for _, open_node in open_list)
            
            if not in_open:
                heapq.heappush(open_list, (new_node.f, new_node))

    return None

def calculate_path(start_node: dict, goal_node: dict, available_paths: list):
    """
    Calculates the shortest path using A* on a predefined graph.
    """
    graph = build_graph(available_paths)

    start = (start_node['x'], start_node['y'])
    end = (goal_node['x'], goal_node['y'])
    
    if start not in graph or end not in graph:
        return {"error": "Start or goal node is not a part of the available paths."}

    path = astar_search(graph, start, end)

    if path:
        return path
    else:
        return {"error": "No path found between the nodes."}