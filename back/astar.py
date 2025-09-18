import heapq

class AStarNode:
    #Node class for A star
    def __init__(self, parent=None, position=None):
        self.parent = parent
        self.position = position
        self.g_cost = 0  # Cost from start
        self.h_cost = 0  # Heuristic cost
        self.f_cost = 0  # Total cost
    
    def __eq__(self, other):
        return self.position == other.position
    
    def __lt__(self, other):
        return self.f_cost < other.f_cost


def init_graph(edges: list):
    """
    Convert list of edges into an
    adjacency list representation.
    """
    adjacency = {}
    
    for edge in edges:
        start = (edge.x1, edge.y1)
        end = (edge.x2, edge.y2)
        
        adjacency.setdefault(start, []).append(end)
        adjacency.setdefault(end, []).append(start)
    
    return adjacency


def astar(adjacency, start, goal):
    """
    A* search algorithm
    implementation.
    """
    start_node = AStarNode(None, start)
    goal_node = AStarNode(None, goal)

    open_heap = []
    closed_set = set()

    heapq.heappush(open_heap, (start_node.f_cost, start_node))

    while open_heap:
        _, current = heapq.heappop(open_heap)
        closed_set.add(current.position)

        if current.position == goal_node.position:
            path = []
            while current:
                path.append(current.position)
                current = current.parent
            return path[::-1]

        for neighbor_pos in adjacency.get(current.position, []):
            if neighbor_pos in closed_set:
                continue

            neighbor = AStarNode(current, neighbor_pos)
            neighbor.g_cost = current.g_cost + 1
            neighbor.h_cost = abs(neighbor.position[0] - goal_node.position[0]) + \
                              abs(neighbor.position[1] - goal_node.position[1])
            neighbor.f_cost = neighbor.g_cost + neighbor.h_cost

            in_open = any(n.position == neighbor.position and n.g_cost <= neighbor.g_cost
                          for _, n in open_heap)

            if not in_open:
                heapq.heappush(open_heap, (neighbor.f_cost, neighbor))

    return None


def find_path(start_node: dict, goal_node: dict, edges: list):
    """
    Wrapper function to compute the
    shortest path using A*.
    """
    adjacency = init_graph(edges)

    start = (start_node['x'], start_node['y'])
    goal = (goal_node['x'], goal_node['y'])
    
    if start not in adjacency or goal not in adjacency:
        return {"error": "Start or goal node is not part of the graph."}

    path = astar(adjacency, start, goal)

    return path if path else {"error": "No path found between the nodes."}
