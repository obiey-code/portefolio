import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_iphone_frame(inner_img, title=""):
    """
    Wraps an inner screenshot into a high quality iPhone 15 Pro style frame.
    Adds status bar, notch/dynamic island, home bar, and rounded glass frame.
    """
    # Resize inner image to standard phone screen aspect ratio
    screen_w = 400
    screen_h = 820

    img_aspect = inner_img.width / inner_img.height
    target_aspect = screen_w / screen_h

    # Fit or crop
    if img_aspect > target_aspect:
        # standard height, crop width
        new_h = screen_h
        new_w = int(new_h * img_aspect)
        resized = inner_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        left = (new_w - screen_w) // 2
        screen_img = resized.crop((left, 0, left + screen_w, screen_h))
    else:
        # standard width, crop height
        new_w = screen_w
        new_h = int(new_w / img_aspect)
        resized = inner_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        top = 0
        screen_img = resized.crop((0, top, screen_w, top + screen_h))

    # Rounded corners for inner screen
    corner_radius = 42
    mask = Image.new("L", (screen_w, screen_h), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, screen_w, screen_h], radius=corner_radius, fill=255)

    # Frame padding
    border_px = 16
    bezel_px = 6
    outer_w = screen_w + (border_px + bezel_px) * 2
    outer_h = screen_h + (border_px + bezel_px) * 2

    # Canvas
    canvas = Image.new("RGBA", (outer_w, outer_h + 40), (0, 0, 0, 0))
    canvas_draw = ImageDraw.Draw(canvas)

    # Outer device body (Dark Titanium / Space Black)
    outer_rect = [20, 20, outer_w - 20, outer_h - 20]
    canvas_draw.rounded_rectangle(
        [0, 0, outer_w, outer_h],
        radius=corner_radius + border_px + bezel_px,
        fill=(30, 32, 38, 255),
        outline=(60, 64, 72, 255),
        width=2
    )

    # Screen Bezel
    canvas_draw.rounded_rectangle(
        [border_px, border_px, outer_w - border_px, outer_h - border_px],
        radius=corner_radius + bezel_px,
        fill=(10, 10, 12, 255)
    )

    # Place screen
    screen_x = border_px + bezel_px
    screen_y = border_px + bezel_px
    canvas.paste(screen_img, (screen_x, screen_y), mask)

    # Draw Dynamic Island
    di_w, di_h = 110, 28
    di_x = (outer_w - di_w) // 2
    di_y = screen_y + 14
    overlay_draw = ImageDraw.Draw(canvas)
    overlay_draw.rounded_rectangle([di_x, di_y, di_x + di_w, di_y + di_h], radius=14, fill=(0, 0, 0, 255))
    # Camera dot
    overlay_draw.ellipse([di_x + di_w - 22, di_y + 8, di_x + di_w - 10, di_y + 20], fill=(15, 18, 35, 255))

    # Home Indicator bar
    bar_w, bar_h = 120, 5
    bar_x = (outer_w - bar_w) // 2
    bar_y = screen_y + screen_h - 14
    overlay_draw.rounded_rectangle([bar_x, bar_y, bar_x + bar_w, bar_y + bar_h], radius=3, fill=(255, 255, 255, 180))

    return canvas

def create_mac_frame(inner_img, title="Coursly Web App"):
    """
    Wraps an inner screenshot into a high quality macOS / MacBook Pro style frame.
    Adds window top bar with traffic light buttons, title, and metallic chassis.
    """
    target_screen_w = 960
    target_screen_h = 600

    # Resize inner image to fit web aspect ratio
    img_aspect = inner_img.width / inner_img.height
    target_aspect = target_screen_w / target_screen_h

    if img_aspect > target_aspect:
        new_h = target_screen_h
        new_w = int(new_h * img_aspect)
        resized = inner_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        left = (new_w - target_screen_w) // 2
        screen_img = resized.crop((left, 0, left + target_screen_w, target_screen_h))
    else:
        new_w = target_screen_w
        new_h = int(new_w / img_aspect)
        resized = inner_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        top = 0
        screen_img = resized.crop((0, top, target_screen_w, top + target_screen_h))

    header_h = 36
    bezel_m = 12
    window_w = target_screen_w + bezel_m * 2
    window_h = target_screen_h + header_h + bezel_m * 2

    # Laptop base notch height
    base_h = 24

    canvas = Image.new("RGBA", (window_w + 40, window_h + base_h + 20), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)

    # Outer Macbook Screen Frame (Space Gray)
    corner_r = 16
    draw.rounded_rectangle(
        [20, 10, 20 + window_w, 10 + window_h],
        radius=corner_r,
        fill=(28, 30, 36, 255),
        outline=(50, 54, 62, 255),
        width=2
    )

    # Top Bar (macOS Window Title Bar)
    tb_x = 20 + bezel_m
    tb_y = 10 + bezel_m
    tb_w = target_screen_w

    # Window content area background
    draw.rectangle([tb_x, tb_y, tb_x + tb_w, tb_y + header_h + target_screen_h], fill=(18, 20, 24, 255))

    # Traffic lights (Close, Minimize, Maximize)
    light_y = tb_y + header_h // 2
    draw.ellipse([tb_x + 14 - 6, light_y - 6, tb_x + 14 + 6, light_y + 6], fill=(255, 95, 86, 255))
    draw.ellipse([tb_x + 34 - 6, light_y - 6, tb_x + 34 + 6, light_y + 6], fill=(255, 189, 46, 255))
    draw.ellipse([tb_x + 54 - 6, light_y - 6, tb_x + 54 + 6, light_y + 6], fill=(255, 39, 76, 255)) # green: 39,201,63
    draw.ellipse([tb_x + 54 - 6, light_y - 6, tb_x + 54 + 6, light_y + 6], fill=(39, 201, 63, 255))

    # Address bar style pill in center
    pill_w = 320
    pill_h = 22
    pill_x = tb_x + (tb_w - pill_w) // 2
    pill_y = tb_y + (header_h - pill_h) // 2
    draw.rounded_rectangle([pill_x, pill_y, pill_x + pill_w, pill_y + pill_h], radius=6, fill=(35, 38, 46, 255))

    # Paste web screen below top bar
    screen_x = tb_x
    screen_y = tb_y + header_h
    canvas.paste(screen_img, (screen_x, screen_y))

    # Laptop Base (Aluminum notch)
    base_top = 10 + window_h
    base_w = window_w + 60
    base_x = (canvas.width - base_w) // 2
    draw.rounded_rectangle([base_x, base_top, base_x + base_w, base_top + 14], radius=6, fill=(180, 185, 195, 255))
    draw.rounded_rectangle([base_x + base_w//2 - 50, base_top, base_x + base_w//2 + 50, base_top + 6], radius=3, fill=(120, 125, 135, 255))

    return canvas

def process_all_coursly_assets():
    source_dir = "images/coursly"
    out_dir = "images/coursly_framed"
    os.makedirs(out_dir, exist_ok=True)

    mobile_files = [
        "coursly_mobile_splash_chargement.jpeg",
        "coursly_mobile_marketplace_categories.jpeg",
        "coursly_mobile_client_actions.jpeg",
        "coursly_mobile_client_portefeuille.jpeg",
        "coursly_mobile_coursier_cockpit.jpeg",
        "coursly_mobile_coursier_navigation_gps.jpeg",
        "coursly_mobile_visiteur_outils.jpeg",
    ]

    web_files = [
        ("coursly_web_admin_roles_permissions.jpeg", "Coursly Admin - Gestion des Rôles"),
        ("coursly_web_partenaire_catalogue.jpeg", "Coursly Partenaire - Catalogue Produits"),
    ]

    framed_paths = []

    print("Framing iPhone Mobile Screens...")
    for mf in mobile_files:
        path = os.path.join(source_dir, mf)
        img = Image.open(path).convert("RGBA")
        framed = create_iphone_frame(img, title=mf)
        out_path = os.path.join(out_dir, mf.replace(".jpeg", "_iphone.png"))
        framed.save(out_path, "PNG")
        framed_paths.append(out_path)
        print(f"Saved: {out_path}")

    print("Framing macOS Web Screens...")
    for wf, title in web_files:
        path = os.path.join(source_dir, wf)
        img = Image.open(path).convert("RGBA")
        framed = create_mac_frame(img, title=title)
        out_path = os.path.join(out_dir, wf.replace(".jpeg", "_mac.png"))
        framed.save(out_path, "PNG")
        framed_paths.append(out_path)
        print(f"Saved: {out_path}")

    return framed_paths

if __name__ == "__main__":
    process_all_coursly_assets()
