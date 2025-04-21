import os
from PIL import Image, ImageOps

# Configuration infaillible
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
INPUT_DIR = os.path.join(BASE_DIR, 'public', 'icons')
OUTPUT_DIR = os.path.join(BASE_DIR, 'public', 'icons_processed')
TARGET_SIZE = (86, 68)

def verify_paths():
    """Vérification visuelle des chemins"""
    print("\n🔍 Diagnostics:")
    print("Script location:", __file__)
    print("BASE_DIR:", BASE_DIR)
    print("INPUT_DIR:", INPUT_DIR)
    print("OUTPUT_DIR:", OUTPUT_DIR)
    
    if not os.path.exists(INPUT_DIR):
        print(f"❌ ERREUR: Le dossier {INPUT_DIR} n'existe pas")
        print("Solution: Vérifiez que:")
        print(f"1. Le dossier 'public/icons' existe bien dans {BASE_DIR}")
        print(f"2. Vous avez placé les images dans {INPUT_DIR}")
        return False
    
    print(f"✅ Dossier source trouvé ({len(os.listdir(INPUT_DIR))} fichiers)")
    return True

def process_images():
    """Version ultra-robuste"""
    if not verify_paths():
        exit(1)
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    for filename in os.listdir(INPUT_DIR):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            try:
                img_path = os.path.join(INPUT_DIR, filename)
                output_path = os.path.join(OUTPUT_DIR, f"processed_{filename.split('.')[0]}.png")
                
                with Image.open(img_path) as img:
                    img = ImageOps.fit(img.convert("RGBA"), TARGET_SIZE, Image.LANCZOS)
                    img.save(output_path, "PNG")
                
                print(f"✅ {filename} → {os.path.basename(output_path)}")
            except Exception as e:
                print(f"❌ Erreur sur {filename}: {type(e).__name__} - {str(e)}")

if __name__ == "__main__":
    print("\n⚽ TRAITEMENT D'IMAGES FOOTBALL ⚽")
    print("----------------------------------")
    process_images()
    print("\nOpération terminée. Vérifiez le dossier:", OUTPUT_DIR)