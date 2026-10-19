import os
import glob
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from moviepy import ImageSequenceClip

def build_coursly_demo_video():
    out_dir = "videos"
    os.makedirs(out_dir, exist_ok=True)
    out_mp4 = os.path.join(out_dir, "coursly_demo.mp4")

    # Target video size 1280x720
    vw, vh = 1280, 720
    fps = 30
    duration_per_slide = 2.5 # seconds
    transition_duration = 0.5 # seconds

    slides = [
        {
            "img": "images/coursly_framed/coursly_mobile_splash_chargement_iphone.png",
            "title": "Coursly - Application Mobile & Web Platform",
            "subtitle": "L'écosystème complet de livraison express & services de proximité"
        },
        {
            "img": "images/coursly_framed/coursly_mobile_marketplace_categories_iphone.png",
            "title": "Marketplace Client & Navigation Intuitive",
            "subtitle": "Restaurants, Boutiques, Supermarchés, Colis & Services sur-mesure"
        },
        {
            "img": "images/coursly_framed/coursly_mobile_client_actions_iphone.png",
            "title": "Commandes Rapides & Suivi d'Expédition",
            "subtitle": "Interface client fluide pour passer et suivre vos courses en direct"
        },
        {
            "img": "images/coursly_framed/coursly_mobile_client_portefeuille_iphone.png",
            "title": "Portefeuille Virtuel & Solde In-App",
            "subtitle": "Recharge sécurisée, paiement instantané et historique des transactions"
        },
        {
            "img": "images/coursly_framed/coursly_mobile_coursier_cockpit_iphone.png",
            "title": "Espace Coursier - Cockpit & Gains",
            "subtitle": "Gestion du statut en ligne, suivi des revenus et des courses attribuées"
        },
        {
            "img": "images/coursly_framed/coursly_mobile_coursier_navigation_gps_iphone.png",
            "title": "Espace Coursier - Navigation GPS & Livraisons",
            "subtitle": "Guidage GPS temps réel, itinéraire optimisé & validation de livraison"
        },
        {
            "img": "images/coursly_framed/coursly_web_partenaire_catalogue_mac.png",
            "title": "Portal Web Partenaire - Gestion de Catalogue",
            "subtitle": "Gestion en temps réel des produits, des prix et des commandes entrantes"
        },
        {
            "img": "images/coursly_framed/coursly_web_admin_roles_permissions_mac.png",
            "title": "Back-Office Administration - Contrôle & Rôles",
            "subtitle": "Supervision globale, attribution des rôles d'équipe et sécurité avancée"
        }
    ]

    rendered_frames = []

    for slide_idx, slide in enumerate(slides):
        # Create base slide image
        base = Image.new("RGB", (vw, vh), (15, 18, 28))
        draw = ImageDraw.Draw(base)

        # Draw background gradient/glow pattern
        for r in range(400, 0, -20):
            alpha = int(35 * (r / 400))
            draw.ellipse([vw//2 - r, vh//2 - r, vw//2 + r, vh//2 + r], fill=(25 + alpha, 30 + alpha, 60 + alpha))

        # Draw text
        # Title box
        title_text = slide["title"]
        subtitle_text = slide["subtitle"]

        # Load item image
        item_img = Image.open(slide["img"]).convert("RGBA")

        # Scale item to fit layout
        max_h = 580
        max_w = 600 if "mac" in slide["img"] else 400

        item_ratio = item_img.width / item_img.height
        if item_img.height > max_h:
            item_h = max_h
            item_w = int(item_h * item_ratio)
        else:
            item_w, item_h = item_img.width, item_img.height

        item_resized = item_img.resize((item_w, item_h), Image.Resampling.LANCZOS)

        # Position image on right/center
        img_x = (vw - item_w) // 2 + 180 if "mac" not in slide["img"] else (vw - item_w) // 2
        img_y = (vh - item_h) // 2

        # If mobile iPhone, place side text on left
        if "iphone" in slide["img"]:
            base.paste(item_resized, (img_x, img_y), item_resized)
            # Text area on left
            draw.text((80, 220), title_text, fill=(255, 255, 255))
            draw.text((80, 280), subtitle_text, fill=(180, 190, 210))
            draw.text((80, 360), f"Module {slide_idx+1} / {len(slides)}", fill=(99, 102, 241))
            draw.text((80, 400), "✓ Interface Responsive\n✓ Traitement Temps Réel\n✓ Sécurité Renforcée", fill=(148, 163, 184))
        else:
            # Web screenshot layout
            img_x = (vw - item_w) // 2
            img_y = 120
            base.paste(item_resized, (img_x, img_y), item_resized)
            draw.text((80, 40), title_text, fill=(255, 255, 255))
            draw.text((80, 80), subtitle_text, fill=(180, 190, 210))

        # Generate frames for this slide duration
        slide_frame_count = int(duration_per_slide * fps)
        frame_np = np.array(base)
        for _ in range(slide_frame_count):
            rendered_frames.append(frame_np)

    clip = ImageSequenceClip(rendered_frames, fps=fps)
    clip.write_videofile(out_mp4, codec="libx264", audio=False)
    print(f"Demo video generated successfully at {out_mp4}")

if __name__ == "__main__":
    build_coursly_demo_video()
