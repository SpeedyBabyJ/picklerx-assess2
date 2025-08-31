# verify_and_render.py
# Reads triplets from data.txt, verifies input, and renders ASCII.
# It also prints a fingerprint so you know it's the *same* bytes you pasted.

import hashlib

def read_tokens(path="data.txt"):
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()
    # fingerprint of EXACT bytes, including line endings
    sha = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    # tokens are non-empty trimmed lines
    tokens = [ln.strip() for ln in raw.splitlines() if ln.strip()]
    return raw, sha, tokens

def parse_triplets(tokens):
    if len(tokens) % 3 != 0:
        raise ValueError(f"Expected tokens in multiples of 3 (x, ch, y). Got {len(tokens)}.")
    triplets = []
    for i in range(0, len(tokens), 3):
        x = int(tokens[i])
        ch = tokens[i+1]
        y = int(tokens[i+2])
        triplets.append((x, ch, y))
    return triplets

def render(triplets):
    max_x = max(x for x, _, __ in triplets)
    max_y = max(y for _, __, y in triplets)
    grid = [[" " for _ in range(max_x + 1)] for _ in range(max_y + 1)]
    for x, ch, y in triplets:
        grid[y][x] = ch
    # Replace ░ with space for visibility
    lines = ["".join(row).replace("░", " ") for row in grid]
    return lines, (max_x + 1, max_y + 1)

if __name__ == "__main__":
    raw, sha, tokens = read_tokens("data.txt")
    print(f"SHA256 of data.txt: {sha}")
    print(f"Non-empty tokens: {len(tokens)}  (should be divisible by 3)")
    triplets = parse_triplets(tokens)
    print(f"Triplets: {len(triplets)}")
    print(f"First 5 triplets: {triplets[:5]}")
    print(f"Last 5 triplets:  {triplets[-5:]}")
    lines, (w, h) = render(triplets)
    print(f"Grid size: width={w}, height={h}")
    print("\n=== RENDERED OUTPUT ===")
    for line in lines:
        print(line)
    with open("out.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print("\nSaved rendered output to out.txt")

