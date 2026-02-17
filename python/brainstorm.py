# s = 'xabacbadefghg'
s = 'xafcbbbdbcebaadfcgh'
x = 7
x = 10

def isCycle(path):
    # print(path)
    # if len(path) < 3: return True
    diff = ord(path[0]) - ord(path[1])
    # print("path: ", path, diff)
    if not diff in [-1, 1]:
        return False
    for i in range(1, len(path)-1):
        if (diff == 1 and path[i] == "a" and path[i+1] == "h") or \
           (diff == -1 and path[i] == "h" and path[i+1] == "a"):
            continue
        # print(diff)
        if not ord(path[i]) - ord(path[i+1]) == diff:
            return False
    return True

g = {
        1: [2, 5],
        2: [1, 3, 4],
        3: [2],
        4: [2, 5, 7],
        5: [1, 4, 6],
        6: [5],
        7: [4, 8],
        8: [7, 9, 12],
        9: [8, 10, 12],
        10: [9, 11],
        11: [10, 12],
        12: [8, 9, 11]
}

g = {
    1: [2, 5, 6],
    2: [1, 3, 10],
    3: [2, 4, 7, 8, 11],
    4: [3, 8],
    5: [1, 9, 16],
    6: [1, 9],
    7: [3, 10, 15],
    8: [3, 4, 11, 12, 13],
    9: [5, 6, 14],
    10: [2, 7, 14, 15],
    11: [3, 8, 13, 15],
    12: [8, 13, 18],
    13: [8, 11, 12, 17],
    14: [9, 10, 15, 16],
    15: [7, 10, 11, 14, 17],
    16: [5, 14],
    17: [13, 15, 18],
    18: [12, 17]
}


def merge_paths(path1, path2):
    """
    Merge two paths by connecting the end of path1 with the start of path2.
    
    Args:
        path1: List of indices (node indices)
        path2: List of indices (node indices)
    
    Returns:
        Merged path (list of indices) if valid cycle, None otherwise
    """
    if not path1 or not path2:
        return None
    
    # Create merged path by combining both paths
    # Remove duplicate at the junction point if path1[-1] == path2[0]
    if path1[-1] == path2[0]:
        merged = path1 + path2[1:]
    else:
        merged = path1 + path2
    
    # Extract characters from indices in string s
    char_path = [s[i] for i in merged]
    
    # Validate with isCycle
    if isCycle(char_path):
        return merged
    else:
        return None

def find_all_merged_paths(paths):
    """
    Find all valid merged paths from a list of paths.
    Tries to merge each pair of paths and keeps valid combinations.
    
    Args:
        paths: List of paths returned from dfs
    
    Returns:
        List of valid merged paths
    """
    valid_merges = []
    
    # Try merging every pair of paths
    for i in range(len(paths)):
        for j in range(i, len(paths)):
            if i != j:
                merged = merge_paths(paths[i][::-1], paths[j])
                if merged and merged not in valid_merges:
                    valid_merges.append(merged)
    
    return valid_merges


def dfs(x, p, fp):
    #print(x, p, fp)
    neighbors = [i for i in g[x] if i not in p]
    cycle = False
    #print(neighbors)
    for n in neighbors:
        path = [s[i] for i in p + [n]]
        if isCycle(path):
            cycle = True
            fp = dfs(n, p + [n], fp)
    if not cycle or not neighbors:
        return fp + [p]
    return fp

# print(dfs(x, [x], []))


paths = dfs(x, [x], [])
print("Paths from DFS:")
for path in paths:
    print(f"  {path} -> {[s[i] for i in path]}")

print("\n" + "="*60)

# Find all valid merged paths
merged_paths = find_all_merged_paths(paths)
print(f"\nValid merged paths:")
if merged_paths:
    for merged in merged_paths:
        char_sequence = [s[i] for i in merged]
        print(f"  {merged} -> {char_sequence}")
else:
    print("  No valid merged paths found")

print("\n" + "="*60)


# print(isCycle([i for i in "edcbahg"]))
