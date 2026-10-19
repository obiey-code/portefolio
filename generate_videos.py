import os
import glob
from PIL import Image, ImageDraw, ImageFont
from gtts import gTTS
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

# Helper to generate TTS audio and build video clip sequence
def build_narrated_video(segments, output_path):
    clips = []

    for idx, (text_fr, ftype, img_path, min_dur, sub) in enumerate(segments):
        audio_file = f"temp_audio/{os.path.basename(output_path)}_{idx}.mp3"
        tts = gTTS(text=text_fr, lang='fr')
        tts.save(audio_file)

        audio_clip = mp.AudioFileClip(audio_file)
        actual_duration = max(min_dur, audio_clip.duration + 0.8)

        if ftype == 'iphone':
            pil_img = create_iphone_mockup(img_path, title=f"Étape {idx+1}/{len(segments)}", subtitle=sub)
        else:
            pil_img = create_mac_mockup(img_path, title=f"Étape {idx+1}/{len(segments)}", subtitle=sub)

        temp_frame_path = f"temp_audio/frame_{os.path.basename(output_path)}_{idx}.png"
        pil_img.save(temp_frame_path)

        image_clip = mp.ImageClip(temp_frame_path).with_duration(actual_duration)
        image_clip = image_clip.with_audio(audio_clip)
        clips.append(image_clip)

    final_video = mp.concatenate_videoclips(clips, method="compose")
    print(f"Generating {output_path}... Total duration: {final_video.duration:.2f}s (Min target: 120s)")
    final_video.write_videofile(output_path, fps=15, codec='libx264', audio_codec='aac', bitrate="800k")


# 1. VIDEO 1: AGP Pay Mobile - Inscription et Activation (iPhone)
video1_segments = [
    ("Bienvenue dans la démonstration de l'application mobile AGP Pay sur iPhone. Ce premier module présente le parcours complet d'inscription et d'activation de compte pour les usagers du réseau national de péage.", 'iphone', 'extracted_img/pay_p5_img1.jpeg', 18, "Lancement & Écran d'accueil AGP Pay"),
    ("L'utilisateur commence par choisir son profil d'usager. AGP Pay prend en charge plusieurs catégories d'utilisateurs : les passagers occasionnels, les prépayés, les riverains exonérés et les véhicules administratifs.", 'iphone', 'extracted_img/pay_p5_img3.jpeg', 20, "Choix du Profil Usager"),
    ("Dans le cadre de l'enregistrement initial, le conducteur saisit son numéro de téléphone mobile et reçoit immédiatement un code de confirmation sécurisé par SMS pour vérifier son identité.", 'iphone', 'extracted_img/pay_p6_img1.jpeg', 18, "Vérification OTP par SMS"),
    ("Une fois le numéro authentifié, l'usager renseigne son nom, son prénom ainsi que la plaque d'immatriculation de son véhicule principal. L'application associe automatiquement l'immatriculation au compte usager.", 'iphone', 'extracted_img/pay_p6_img3.jpeg', 22, "Saisie des Informations Personnelles"),
    ("L'application génère alors un QR Code unique d'identification, propre au véhicule. Ce QR Code permettra un passage rapide aux barrières de péage ainsi qu'une vérification instantanée par les agents.", 'iphone', 'extracted_img/pay_p7_img1.jpeg', 20, "Génération du Pass QR Code Sécurisé"),
    ("Le profil est désormais actif. L'utilisateur accède à son tableau de bord mobile affichant son solde en FCFA, son statut d'activation et son historique récent de franchissement des péages.", 'iphone', 'extracted_img/pay_p7_img3.jpeg', 22, "Tableau de bord de l'Usager Mobile"),
    ("Cette architecture développée en Flutter offre une fluidité optimale sur iPhone et garantit une sécurité renforcée des données usagers lors de l'enregistrement.", 'iphone', 'extracted_img/pay_p8_img1.jpeg', 18, "Validation & Fin du Parcours d'Inscription")
]

# 2. VIDEO 2: AGP Pay Mobile - Recharge et Paiement (iPhone)
video2_segments = [
    ("Bienvenue dans cette deuxième démonstration mobile dédiée à la recharge de compte et au paiement des passages de péage via l'application AGP Pay sur iPhone.", 'iphone', 'extracted_img/pay_p9_img2.jpeg', 18, "Consultation du Solde & Choix de Recharge"),
    ("Pour recharger son compte, l'usager sélectionne son mode de paiement mobile money préféré, tel que PayDunya ou SankMoney, très largement utilisés sur le territoire national.", 'iphone', 'extracted_img/pay_p9_img3.jpeg', 20, "Sélection Mobile Money (PayDunya / SankMoney)"),
    ("L'usager indique le montant souhaité en FCFA. L'application initie une transaction sécurisée avec l'API du prestataire de paiement via des webhooks de confirmation instantanée.", 'iphone', 'extracted_img/pay_p9_img4.jpeg', 20, "Saisie du Montant & Validation Webhook"),
    ("Dès validation de la transaction par l'opérateur monétique, le solde de l'application mobile est crédité immédiatement et une notification de confirmation est transmise à l'usager.", 'iphone', 'extracted_img/pay_p10_img1.jpeg', 20, "Confirmation & Mise à jour du Solde"),
    ("Lors de l'arrivée au poste de péage, l'usager présente simplement son QR Code dynamique généré par l'application devant le lecteur optique de la voie de péage.", 'iphone', 'extracted_img/pay_p10_img2.jpeg', 20, "Présentation du QR Code à la voie de péage"),
    ("Le système de voie lit le QR code, vérifie l'autorisation et le solde en moins d'une seconde, puis lève automatiquement la barrière pour autoriser le passage du véhicule.", 'iphone', 'extracted_img/pay_p11_img1.jpeg', 20, "Validation Automatique du Passage"),
    ("Le reçu de passage électronique ainsi que l'historique détaillé du débit sont archivés dans l'application mobile, permettant une traçabilité parfaite des dépenses de déplacement.", 'iphone', 'extracted_img/pay_p11_img3.jpeg', 20, "Archivage du Reçu Numérique & Historique")
]

# 3. VIDEO 3: AGP Admin Web - Dashboard & Monitoring (Mac / macOS)
video3_segments = [
    ("Bienvenue dans la démonstration de la plateforme web d'administration AGP Admin exécutée sur macOS. Ce module présente le tableau de bord principal de supervision et le monitoring en temps réel du réseau national de péage.", 'mac', 'extracted_img/admin_p11_img1.png', 20, "Connexion & Vue d'ensemble du Dashboard"),
    ("Développé avec la technologie Angular, le portail AGP Admin offre une vue synthétique des indicateurs clés : recettes quotidiennes globalisées, nombre total de véhicules franchis et répartition par catégorie.", 'mac', 'extracted_img/admin_p12_img1.png', 22, "Indicateurs Métriques de Performance"),
    ("Le module de carte interactive permet aux administrateurs de surveiller l'état de fonctionnement de l'ensemble des postes de péage répartis sur le réseau routier national.", 'mac', 'extracted_img/admin_p12_img2.png', 20, "Supervision Géographique des Postes"),
    ("Chaque poste transmet en temps réel ses métriques d'activité, la disponibilité des voies, l'état des barrières automatiques et les alertes de fraude ou d'anomalie de passage.", 'mac', 'extracted_img/admin_p14_img1.png', 20, "Monitoring par Poste & Santé des Equipements"),
    ("Les graphiques dynamiques permettent d'analyser les pics de trafic par heure, d'anticiper les engorgements et d'optimiser l'affectation des agents sur les voies de passage.", 'mac', 'extracted_img/admin_p15_img1.png', 20, "Analyse des Flux & Trafic Horaire"),
    ("Grâce à une interface réactive et sécurisée avec filtrage par rôle JWT, AGP Admin garantit un contrôle centralisé et efficace de toute l'infrastructure de péage intelligent.", 'mac', 'extracted_img/admin_p15_img2.png', 22, "Sécurité JWT & Contrôle d'Accès Administration")
]

# 4. VIDEO 4: AGP Admin Web - Gestion des Postes & Tarifs (Mac / macOS)
video4_segments = [
    ("Bienvenue dans ce quatrième module vidéo consacré à la configuration technique des postes de péage et à la gestion des grilles tarifaires sur le portail web AGP Admin.", 'mac', 'extracted_img/admin_p16_img1.png', 20, "Module de Configuration des Postes"),
    ("Les administrateurs peuvent créer, modifier ou suspendre des postes de péage sur la plateforme, en définissant la localisation, le nombre de voies et les équipements installés.", 'mac', 'extracted_img/admin_p17_img1.png', 20, "Paramétrage des Lignes & Voies de Péage"),
    ("Le module de tarification permet d'établir des grilles de tarifs différenciées selon la catégorie de véhicule : motos, véhicules légers, poids lourds et transports exceptionnels.", 'mac', 'extracted_img/admin_p18_img1.png', 22, "Définition des Grilles Tarifaires par Catégorie"),
    ("AGP Admin prend également en charge la gestion des exonérations spécifiques pour les véhicules de secours, les forces de l'ordre et les riverains bénéficiant de tarifs préférentiels.", 'mac', 'extracted_img/admin_p18_img2.png', 22, "Gestion des Exonérations & Abonnements"),
    ("Toute modification des règles tarifaires est immédiatement propagée vers les serveurs locaux des péages grâce à notre mécanisme de synchronisation en arrière-plan.", 'mac', 'extracted_img/admin_p19_img1.png', 20, "Propagation des Paramètres aux Serveurs Locaux"),
    ("Cette flexibilité garantit l'alignement immédiat de l'ensemble des sites de péage sur la politique tarifaire nationale du Ministère des Transports.", 'mac', 'extracted_img/admin_p20_img1.png', 20, "Validation & Publication des Directives")
]

# 5. VIDEO 5: AGP System - Synchronisation Cloud & Reporting (iPhone + Mac / macOS)
video5_segments = [
    ("Bienvenue dans le cinquième et dernier module de présentation de l'écosystème complet AGP : la synchronisation multi-sites DataSynchro, la gestion du mode déconnecté et le reporting cloud.", 'mac', 'extracted_img/admin_p21_img1.png', 22, "Architecture Multi-Sites & DataSynchro"),
    ("Le moteur DataSynchro assure une réplication bidirectionnelle entre le serveur Cloud central hébergé sur VPS et les bases de données locales de chaque poste de péage.", 'mac', 'extracted_img/admin_p23_img1.png', 22, "Moteur de Synchronisation Bidirectionnelle Cloud/Local"),
    ("En cas de coupure de la connexion Internet nationale, les postes de péage continuent de fonctionner en toute autonomie grâce à la base de données locale synchronisée.", 'iphone', 'extracted_img/pay_p12_img1.jpeg', 20, "Mode Déconnecté & Résilience Hors-Ligne"),
    ("Dès que le réseau réseau est rétabli, les transactions enregistrées en local sont automatiquement téléversées vers le Cloud sans aucune perte de données ni interruption de service.", 'mac', 'extracted_img/admin_p25_img1.png', 22, "Rattrapage Automatique après Reconnexion"),
    ("Le module de reporting produit des bilans financiers détaillés, des rapports d'audit comptable et des exports certifiés pour les autorités de régulation du péage.", 'mac', 'extracted_img/admin_p28_img1.png', 20, "Génération de Bilans & Audits Financials"),
    ("L'écosystème AGP, combinant mobile Flutter et web Angular autour d'un backend Django REST robuste, illustre notre expertise dans le déploiement de solutions critiques complexes.", 'mac', 'extracted_img/admin_p30_img1.png', 22, "Conclusion & Synergie de l'Architecture AGP")
]

if __name__ == "__main__":
    print("=== STARTING VIDEO GENERATION ===")
    build_narrated_video(video1_segments, 'videos/agp_pay_mobile_inscription_passager.mp4')
    build_narrated_video(video2_segments, 'videos/agp_pay_mobile_recharge_paiement.mp4')
    build_narrated_video(video3_segments, 'videos/agp_admin_web_dashboard_monitoring.mp4')
    build_narrated_video(video4_segments, 'videos/agp_admin_web_gestion_postes_tarifs.mp4')
    build_narrated_video(video5_segments, 'videos/agp_system_synchro_cloud_reporting.mp4')
    print("=== ALL 5 VIDEOS GENERATED SUCCESSFULLY! ===")
