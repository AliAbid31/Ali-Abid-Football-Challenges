import os
from PIL import Image, ImageOps
import numpy as np

# === CONFIGURATION ===
input_folder = "../public/logos"           # Dossier contenant les logos
output_folder = "../public/modified_logos" # Dossier de sortie
target_size = (60, 60)                     # Taille finale des images

# Créer le dossier de sortie s'il n'existe pas
os.makedirs(output_folder, exist_ok=True)

# === Traitement des images ===
def crop_whitespace(img):
    """Supprime les marges blanches autour du logo"""
    img = img.convert("RGBA")  # Assure canal alpha si existant
    np_img = np.array(img)

    if np_img.shape[2] == 4:
        alpha = np_img[:, :, 3] > 0
    else:
        gray = np.mean(np_img[:, :, :3], axis=2)
        alpha = gray < 250  # seuil pour détecter "blanc"

    coords = np.argwhere(alpha)
    if coords.size == 0:
        return img  # tout blanc, on ne fait rien

    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0) + 1
    return img.crop((x0, y0, x1, y1))

def resize_and_pad(img, size=(60, 60)):
    """Redimensionne tout en gardant le ratio, puis ajoute des bordures pour arriver à la taille exacte"""
    img.thumbnail(size, Image.LANCZOS)
    delta_w = size[0] - img.width
    delta_h = size[1] - img.height
    padding = (delta_w // 2, delta_h // 2, delta_w - delta_w // 2, delta_h - delta_h // 2)
    return ImageOps.expand(img, padding, fill=(255, 255, 255, 0))  # fond transparent

# === Traitement de chaque image ===
for filename in os.listdir(input_folder):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
        print(f"[Traitement] {filename}")
        path = os.path.join(input_folder, filename)

        try:
            img = Image.open(path)
            img = crop_whitespace(img)
            img = resize_and_pad(img, target_size)

            name, _ = os.path.splitext(filename)
            save_path = os.path.join(output_folder, f"{name}_60x60.png")
            img.save(save_path)
            print(f"[OK] Sauvé dans : {save_path}")
        except Exception as e:
            print(f"[ERREUR] Impossible de traiter {filename} : {e}")
