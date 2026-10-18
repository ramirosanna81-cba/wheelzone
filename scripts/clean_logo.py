from PIL import Image
from collections import deque

def clean_logo():
    src_path = 'public/images/logos/logo-swoosh-banner.jpg'
    raw_img = Image.open(src_path).convert('RGB')
    w, h = raw_img.size

    # 1. Identify flame bounding box
    red_pixels = []
    for y in range(h):
        for x in range(w):
            r, g, b = raw_img.getpixel((x, y))
            if r > 160 and g < 70 and b < 70:
                red_pixels.append((x, y))

    min_x = max(0, min(p[0] for p in red_pixels) - 10)
    max_x = min(w, max(p[0] for p in red_pixels) + 10)
    min_y = max(0, min(p[1] for p in red_pixels) - 8)
    max_y = min(h, max(p[1] for p in red_pixels) + 8)

    print(f"Cropping from x=[{min_x}, {max_x}], y=[{min_y}, {max_y}]")
    cropped = raw_img.crop((min_x, min_y, max_x, max_y)).convert('RGBA')
    cw, ch = cropped.size
    pixels = cropped.load()

    # 2. Flood fill from borders to turn outer background transparent
    visited = [[False] * ch for _ in range(cw)]
    queue = deque()

    def is_outer_white(r, g, b):
        # White/cream background pixel
        return r >= 220 and g >= 220 and b >= 220

    # Initialize queue along all 4 outer borders of cropped image
    for x in range(cw):
        for y in [0, ch - 1]:
            r, g, b, a = pixels[x, y]
            if is_outer_white(r, g, b):
                visited[x][y] = True
                queue.append((x, y))

    for y in range(ch):
        for x in [0, cw - 1]:
            if not visited[x][y]:
                r, g, b, a = pixels[x, y]
                if is_outer_white(r, g, b):
                    visited[x][y] = True
                    queue.append((x, y))

    while queue:
        cx, cy = queue.popleft()
        r, g, b, a = pixels[cx, cy]
        
        # Soft anti-aliased edge
        whiteness = min(r, g, b)
        if whiteness >= 242:
            pixels[cx, cy] = (0, 0, 0, 0)
        else:
            alpha = max(0, min(255, int((255 - whiteness) * 5)))
            pixels[cx, cy] = (r, g, b, alpha)

        for nx, ny in ((cx+1, cy), (cx-1, cy), (cx, cy+1), (cx, cy-1)):
            if 0 <= nx < cw and 0 <= ny < ch and not visited[nx][ny]:
                nr, ng, nb, na = pixels[nx, ny]
                if is_outer_white(nr, ng, nb):
                    visited[nx][ny] = True
                    queue.append((nx, ny))

    # Also check if any small island in the outer corners remained unvisited
    for y in range(ch):
        for x in range(cw):
            r, g, b, a = pixels[x, y]
            # If it's pure white and not part of the letters (check if far from center or y bounds)
            if not visited[x][y] and (r > 250 and g > 250 and b > 250) and (y < 12 or y > ch - 12 or x < 12 or x > cw - 12):
                pixels[x, y] = (0, 0, 0, 0)

    # Save transparent PNG
    cropped.save('public/images/logos/logo-swoosh-transparent.png', 'PNG')
    cropped.save('public/images/logos/logo-swoosh-banner.png', 'PNG')
    print("Saved logo-swoosh-transparent.png and logo-swoosh-banner.png")

    # Dark carbon background version (#0E0E0E matches surface-container-lowest)
    dark_bg = Image.new('RGB', cropped.size, (14, 14, 14))
    dark_bg.paste(cropped, (0, 0), cropped)
    dark_bg.save('public/images/logos/logo-swoosh-dark.png', 'PNG')
    dark_bg.save('public/images/logos/logo-swoosh-banner.jpg', 'JPEG', quality=98)
    print("Saved logo-swoosh-dark.png and updated logo-swoosh-banner.jpg with dark background")

if __name__ == '__main__':
    clean_logo()
