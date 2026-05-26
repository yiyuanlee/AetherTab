import os
import zlib
import struct

def create_png_rgba(width, height):
    """
    Creates a simple PNG byte array with a gradient from purple to pink.
    """
    # PNG signature
    png = bytearray([137, 80, 78, 71, 13, 10, 26, 10])

    # IHDR chunk
    # Width (4 bytes), Height (4 bytes), Bit depth (1 byte, 8), Color type (1 byte, 6 for RGBA),
    # Compression (1 byte, 0), Filter (1 byte, 0), Interlace (1 byte, 0)
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    
    def make_chunk(chunk_type, chunk_data):
        length = struct.pack(">I", len(chunk_data))
        crc = struct.pack(">I", zlib.crc32(chunk_type + chunk_data) & 0xffffffff)
        return length + chunk_type + chunk_data + crc

    png += make_chunk(b"IHDR", ihdr_data)

    # Generate gradient pixels (RGBA)
    # Start color (purple): RGB (139, 92, 246)
    # End color (pink): RGB (236, 72, 153)
    raw_data = bytearray()
    for y in range(height):
        # Scanline filter byte (0 = None)
        raw_data.append(0)
        
        # Interpolation factor
        t = y / (height - 1) if height > 1 else 0
        r = int(139 + (236 - 139) * t)
        g = int(92 + (72 - 92) * t)
        b = int(246 + (153 - 246) * t)
        
        for x in range(width):
            # Let's make it look like a rounded orb
            # Distance from center
            cx, cy = width / 2.0, height / 2.0
            dx = (x - cx) / cx
            dy = (y - cy) / cy
            dist_sq = dx*dx + dy*dy
            
            # Simple circular mask with soft anti-aliasing
            if dist_sq > 0.95:
                alpha = 0
            elif dist_sq > 0.8:
                # Anti-alias transition
                alpha = int(255 * (0.95 - dist_sq) / 0.15)
            else:
                alpha = 255
                
            raw_data.extend([r, g, b, alpha])

    # IDAT chunk (compressed pixel data)
    idat_data = zlib.compress(raw_data)
    png += make_chunk(b"IDAT", idat_data)

    # IEND chunk
    png += make_chunk(b"IEND", b"")

    return bytes(png)

def generate_all_icons(target_dir):
    os.makedirs(target_dir, exist_ok=True)
    sizes = [16, 48, 128]
    for size in sizes:
        icon_path = os.path.join(target_dir, f"icon{size}.png")
        print(f"Generating {size}x{size} icon to {icon_path}...")
        png_bytes = create_png_rgba(size, size)
        with open(icon_path, "wb") as f:
            f.write(png_bytes)
    print("Icons generation complete!")

if __name__ == "__main__":
    import sys
    dest = sys.argv[1] if len(sys.argv) > 1 else "icons"
    generate_all_icons(dest)
