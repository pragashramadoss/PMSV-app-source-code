"""Trace the existing PMSV family mark into an Android alpha-only vector.

The wordmark is omitted at status-bar size; no replacement artwork is introduced.
Requires Pillow. Run from the repository root.
"""
from collections import defaultdict
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[3]
logo = Image.open(root / 'android/native-app/src/main/res/drawable/pmsv_logo.png').convert('RGB')
# Family emblem's original bounds; text begins below y=360.
logo = logo.crop((105, 53, 407, 355))
mask = {(x, y) for y in range(logo.height) for x in range(logo.width)
        if min(logo.getpixel((x, y))) < 150 and max(logo.getpixel((x, y))) - min(logo.getpixel((x, y))) > 40}
edges = defaultdict(set)
for x, y in mask:
    for neighbor, start, end in [((x, y-1), (x,y), (x+1,y)), ((x+1,y), (x+1,y), (x+1,y+1)),
                                 ((x,y+1), (x+1,y+1), (x,y+1)), ((x-1,y), (x,y+1), (x,y))]:
        if neighbor not in mask:
            edges[start].add(end)

def simplify(points, tolerance=0.65):
    if len(points) < 3:
        return points
    a, b = points[0], points[-1]
    dx, dy = b[0]-a[0], b[1]-a[1]
    scale = (dx*dx+dy*dy)**0.5
    distances = [abs(dy*(p[0]-a[0])-dx*(p[1]-a[1]))/scale if scale else
                 ((p[0]-a[0])**2+(p[1]-a[1])**2)**0.5 for p in points]
    far = max(range(len(points)), key=distances.__getitem__)
    if distances[far] <= tolerance:
        return [a,b]
    return simplify(points[:far+1])[:-1]+simplify(points[far:])

paths = []
while edges:
    start = min(edges)
    polygon = [start]
    current = start
    while True:
        end = min(edges[current])
        edges[current].remove(end)
        if not edges[current]:
            del edges[current]
        polygon.append(end)
        current = end
        if current == start:
            break
    if len(polygon) < 6:
        continue
    split = max(range(len(polygon)), key=lambda i: (polygon[i][0]-start[0])**2+(polygon[i][1]-start[1])**2)
    points = simplify(polygon[:split+1])[:-1]+simplify(polygon[split:])[:-1]
    paths.append('M'+'L'.join(f'{x+9},{y+9}' for x,y in points)+'Z')
path_data = ' '.join(paths)
xml = f'''<!-- PMSV family emblem traced from pmsv_logo.png; Android tints its alpha mask. -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp" android:height="24dp" android:viewportWidth="320" android:viewportHeight="320">
    <path android:fillColor="#FFFFFFFF" android:fillType="evenOdd"
        android:pathData="{path_data}" />
</vector>
'''
(root/'android/native-app/src/main/res/drawable/ic_notification.xml').write_text(xml)
print(f'Generated family emblem: {len(paths)} contours, {len(xml)} bytes')
