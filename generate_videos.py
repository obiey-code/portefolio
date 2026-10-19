import os
import glob
from PIL import Image, ImageDraw, ImageFont
import moviepy as mp

os.makedirs('videos', exist_ok=True)
os.makedirs('temp_audio', exist_ok=True)

# Font helper
def get_font(size=18):
    try:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
    except Exception:
        return ImageFont.load_default()

def get_font_regular(size=14):
    try:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
    except Exception:
        return ImageFont.load_default()

# Helper to create iPhone frame around a mobile image
def create_iphone_mockup(screen_path, width=1280, height=720, title="AGP Pay Mobile", subtitle=""):
    bg = Image.new('RGB', (width, height), (15, 23, 42)) # Slate dark background
    draw = ImageDraw.Draw(bg)

    font_bold = get_font(20)
    font_sub = get_font_regular(15)

    # Draw header banner
    draw.rectangle([0, 0, width, 65], fill=(30, 41, 59))
    draw.text((30, 12), f"📱 DEMO AGP PAY (iPhone) — {title}", fill=(255, 255, 255), font=font_bold)
    if subtitle:
        draw.text((30, 38), subtitle, fill=(148, 163, 184), font=font_sub)

    # Load inner screen image
    try:
        screen = Image.open(screen_path).convert('RGB')
    except Exception:
        screen = Image.new('RGB', (360, 640), (200, 200, 200))

    # Scale screen to fit phone mockup height (~560px)
    phone_h = 580
    aspect = screen.width / screen.height
    phone_w = int(phone_h * aspect)
    screen_resized = screen.resize((phone_w, phone_h), Image.Resampling.LANCZOS)

    # Phone Frame dimensions
    border = 12
    frame_w = phone_w + border * 2
    frame_h = phone_h + border * 2
    frame_x = (width - frame_w) // 2
    frame_y = 80 + (height - 80 - frame_h) // 2

    # Outer Phone Body (iPhone Silver/Titanium look)
    draw.rounded_rectangle([frame_x, frame_y, frame_x + frame_w, frame_y + frame_h], radius=32, fill=(226, 232, 240), outline=(71, 85, 105), width=3)
    # Inner bezel
    draw.rounded_rectangle([frame_x + 4, frame_y + 4, frame_x + frame_w - 4, frame_y + frame_h - 4], radius=28, fill=(15, 23, 42))

    # Paste screen
    bg.paste(screen_resized, (frame_x + border, frame_y + border))

    # Notch / Dynamic Island at top of phone
    island_w = 90
    island_h = 18
    island_x = frame_x + (frame_w - island_w) // 2
    island_y = frame_y + border + 6
    draw.rounded_rectangle([island_x, island_y, island_x + island_w, island_y + island_h], radius=9, fill=(0, 0, 0))

    return bg

# Helper to create Mac / macOS desktop frame around a web image
def create_mac_mockup(screen_path, width=1280, height=720, title="AGP Admin Web Angular", subtitle=""):
    bg = Image.new('RGB', (width, height), (15, 23, 42))
    draw = ImageDraw.Draw(bg)

    font_bold = get_font(20)
    font_sub = get_font_regular(15)

    # Header banner
    draw.rectangle([0, 0, width, 65], fill=(30, 41, 59))
    draw.text((30, 12), f"💻 DEMO AGP ADMIN (Mac / macOS) — {title}", fill=(255, 255, 255), font=font_bold)
    if subtitle:
        draw.text((30, 38), subtitle, fill=(148, 163, 184), font=font_sub)

    # Mac Window dimensions
    win_w = 1080
    win_h = 560
    win_x = (width - win_w) // 2
    win_y = 90

    # Outer window frame (macOS style)
    draw.rounded_rectangle([win_x, win_y, win_x + win_w, win_y + win_h], radius=12, fill=(241, 245, 249), outline=(148, 163, 184), width=2)
    # Title bar
    bar_h = 32
    draw.rounded_rectangle([win_x, win_y, win_x + win_w, win_y + bar_h], radius=12, fill=(226, 232, 240))
    draw.rectangle([win_x, win_y + 20, win_x + win_w, win_y + bar_h], fill=(226, 232, 240))

    # macOS Traffic light buttons
    draw.ellipse([win_x + 15, win_y + 10, win_x + 27, win_y + 22], fill=(239, 68, 68)) # Red
    draw.ellipse([win_x + 35, win_y + 10, win_x + 47, win_y + 22], fill=(245, 158, 11)) # Yellow
    draw.ellipse([win_x + 55, win_y + 10, win_x + 67, win_y + 22], fill=(34, 197, 94)) # Green

    # Browser URL bar
    draw.rounded_rectangle([win_x + 120, win_y + 6, win_x + win_w - 40, win_y + 26], radius=6, fill=(255, 255, 255), outline=(203, 213, 225))
    font_url = get_font_regular(12)
    draw.text((win_x + 130, win_y + 8), "https://agp-admin.national.cg/portal", fill=(100, 116, 139), font=font_url)

    # Load inner web screen
    try:
        screen = Image.open(screen_path).convert('RGB')
    except Exception:
        screen = Image.new('RGB', (1000, 500), (220, 220, 220))

    screen_w = win_w - 4
    screen_h = win_h - bar_h - 2
    screen_resized = screen.resize((screen_w, screen_h), Image.Resampling.LANCZOS)

    bg.paste(screen_resized, (win_x + 2, win_y + bar_h))
    return bg

# Helper to build silent animated MP4 clip sequence without voice audio (Duration >= 15 seconds)
def build_agp_video(segments, output_path):
    clips = []
    # Ensure total duration is at least 15 seconds (e.g., 15.0 to 18.0 seconds)
    segment_duration = max(2.5, 15.0 / len(segments))

    for idx, (text_fr, ftype, img_path, dur, sub) in enumerate(segments):
        if ftype == 'iphone':
            pil_img = create_iphone_mockup(img_path, title=f"Étape {idx+1}/{len(segments)}", subtitle=sub)
        else:
            pil_img = create_mac_mockup(img_path, title=f"Étape {idx+1}/{len(segments)}", subtitle=sub)

        temp_frame_path = f"temp_audio/frame_{os.path.basename(output_path)}_{idx}.png"
        pil_img.save(temp_frame_path)

        image_clip = mp.ImageClip(temp_frame_path).with_duration(segment_duration)
        clips.append(image_clip)

    final_video = mp.concatenate_videoclips(clips, method="compose")
    print(f"Generating MP4 {output_path}... Total duration: {final_video.duration:.2f}s")
    final_video.write_videofile(output_path, fps=15, codec="libx264", audio=False)


# 1. VIDEO 1: AGP Pay Mobile - Inscription et Activation (iPhone)
video1_segments = [
    ("Bienvenue dans la démonstration de l'application mobile AGP Pay sur iPhone.", 'iphone', 'extracted_img/pay_p5_img1.jpeg', 18, "Lancement & Écran d'accueil AGP Pay"),
    ("L'utilisateur commence par choisir son profil d'usager.", 'iphone', 'extracted_img/pay_p5_img3.jpeg', 20, "Choix du Profil Usager"),
    ("Saisie du numéro de téléphone mobile et code OTP par SMS.", 'iphone', 'extracted_img/pay_p6_img1.jpeg', 18, "Vérification OTP par SMS"),
    ("Saisie du nom, prénom et immatriculation du véhicule.", 'iphone', 'extracted_img/pay_p6_img3.jpeg', 22, "Saisie des Informations Personnelles"),
    ("Génération du QR Code unique d'identification du véhicule.", 'iphone', 'extracted_img/pay_p7_img1.jpeg', 20, "Génération du Pass QR Code Sécurisé"),
    ("Tableau de bord usager avec solde et historique.", 'iphone', 'extracted_img/pay_p7_img3.jpeg', 22, "Tableau de bord de l'Usager Mobile"),
    ("Validation et fin du parcours d'inscription.", 'iphone', 'extracted_img/pay_p8_img1.jpeg', 18, "Validation & Fin du Parcours d'Inscription")
]

# 2. VIDEO 2: AGP Pay Mobile - Recharge et Paiement (iPhone)
video2_segments = [
    ("Consultation du solde et choix du mode de recharge.", 'iphone', 'extracted_img/pay_p9_img2.jpeg', 18, "Consultation du Solde & Choix de Recharge"),
    ("Sélection Mobile Money (PayDunya / SankMoney).", 'iphone', 'extracted_img/pay_p9_img3.jpeg', 20, "Sélection Mobile Money (PayDunya / SankMoney)"),
    ("Saisie du montant en FCFA et validation de la transaction.", 'iphone', 'extracted_img/pay_p9_img4.jpeg', 20, "Saisie du Montant & Validation Webhook"),
    ("Confirmation instantanée et crédit du solde mobile.", 'iphone', 'extracted_img/pay_p10_img1.jpeg', 20, "Confirmation & Mise à jour du Solde"),
    ("Présentation du Pass QR Code à la voie de péage.", 'iphone', 'extracted_img/pay_p10_img2.jpeg', 20, "Présentation du QR Code à la voie de péage"),
    ("Lecture automatique du QR code et ouverture de barrière.", 'iphone', 'extracted_img/pay_p11_img1.jpeg', 20, "Validation Automatique du Passage"),
    ("Archivage du reçu numérique et bilan des dépenses.", 'iphone', 'extracted_img/pay_p11_img3.jpeg', 20, "Archivage du Reçu Numérique & Historique")
]

# 3. VIDEO 3: AGP Admin Web - Dashboard & Monitoring (Mac / macOS)
video3_segments = [
    ("Connexion au portail AGP Admin sur macOS.", 'mac', 'extracted_img/admin_p11_img1.png', 20, "Connexion & Vue d'ensemble du Dashboard"),
    ("Indicateurs clés et recettes en temps réel.", 'mac', 'extracted_img/admin_p12_img1.png', 22, "Indicateurs Métriques de Performance"),
    ("Carte interactive de supervision géolocalisée.", 'mac', 'extracted_img/admin_p12_img2.png', 20, "Supervision Géographique des Postes"),
    ("État de santé des barrières et équipements.", 'mac', 'extracted_img/admin_p14_img1.png', 20, "Monitoring par Poste & Santé des Equipements"),
    ("Analyse dynamique du trafic horaire.", 'mac', 'extracted_img/admin_p15_img1.png', 20, "Analyse des Flux & Trafic Horaire"),
    ("Sécurité JWT et contrôle des accès administrateurs.", 'mac', 'extracted_img/admin_p15_img2.png', 22, "Sécurité JWT & Contrôle d'Accès Administration")
]

# 4. VIDEO 4: AGP Admin Web - Gestion des Postes & Tarifs (Mac / macOS)
video4_segments = [
    ("Module de configuration des postes de péage.", 'mac', 'extracted_img/admin_p16_img1.png', 20, "Module de Configuration des Postes"),
    ("Paramétrage des voies et équipements installés.", 'mac', 'extracted_img/admin_p17_img1.png', 20, "Paramétrage des Lignes & Voies de Péage"),
    ("Grilles tarifaires par catégorie de véhicule.", 'mac', 'extracted_img/admin_p18_img1.png', 22, "Définition des Grilles Tarifaires par Catégorie"),
    ("Gestion des abonnements et exonérations.", 'mac', 'extracted_img/admin_p18_img2.png', 22, "Gestion des Exonérations & Abonnements"),
    ("Propagation instantanée des règles vers les serveurs locaux.", 'mac', 'extracted_img/admin_p19_img1.png', 20, "Propagation des Paramètres aux Serveurs Locaux"),
    ("Validation et publication des directives nationales.", 'mac', 'extracted_img/admin_p20_img1.png', 20, "Validation & Publication des Directives")
]

# 5. VIDEO 5: AGP System - Synchronisation Cloud & Reporting (iPhone + Mac / macOS)
video5_segments = [
    ("Architecture multi-sites DataSynchro.", 'mac', 'extracted_img/admin_p21_img1.png', 22, "Architecture Multi-Sites & DataSynchro"),
    ("Réplication bidirectionnelle Cloud/Local.", 'mac', 'extracted_img/admin_p23_img1.png', 22, "Moteur de Synchronisation Bidirectionnelle Cloud/Local"),
    ("Maintien du service en mode déconnecté.", 'iphone', 'extracted_img/pay_p12_img1.jpeg', 20, "Mode Déconnecté & Résilience Hors-Ligne"),
    ("Rattrapage automatique des données après reconnexion.", 'mac', 'extracted_img/admin_p25_img1.png', 22, "Rattrapage Automatique après Reconnexion"),
    ("Bilan financier et audits comptables.", 'mac', 'extracted_img/admin_p28_img1.png', 20, "Génération de Bilans & Audits Financials"),
    ("Synergie de l'architecture AGP (Django, Angular, Flutter).", 'mac', 'extracted_img/admin_p30_img1.png', 22, "Conclusion & Synergie de l'Architecture AGP")
]

if __name__ == "__main__":
    print("=== STARTING AGP MP4 VIDEO GENERATION ===")
    build_agp_video(video1_segments, 'videos/agp_pay_mobile_inscription_passager.mp4')
    build_agp_video(video2_segments, 'videos/agp_pay_mobile_recharge_paiement.mp4')
    build_agp_video(video3_segments, 'videos/agp_admin_web_dashboard_monitoring.mp4')
    build_agp_video(video4_segments, 'videos/agp_admin_web_gestion_postes_tarifs.mp4')
    build_agp_video(video5_segments, 'videos/agp_system_synchro_cloud_reporting.mp4')
    print("=== ALL 5 AGP VIDEOS GENERATED SUCCESSFULLY! ===")
