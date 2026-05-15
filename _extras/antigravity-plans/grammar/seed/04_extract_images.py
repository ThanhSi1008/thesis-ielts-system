import fitz  # PyMuPDF
import os

PDF_PATH = r'c:\Users\Admin\Desktop\thesis\merge\thesis-toeic-system\_extras\antigravity_plans\grammar\MUCLecture_2022_5217521.pdf'

# Where to save both theory and exercise images for the frontend
OUT_DIR = r'c:\Users\Admin\Desktop\thesis\merge\thesis-toeic-system\frontend-web\public\images\grammar\intermediate'

os.makedirs(OUT_DIR, exist_ok=True)

def extract_images():
    print(f"Opening {PDF_PATH}...")
    doc = fitz.open(PDF_PATH)
    
    # Unit 1 theory is on page 14 (index 13)
    start_page_idx = 13
    total_units = 145
    
    # We want high quality images, so we increase the zoom level
    zoom = 2.0  # 200% resolution
    mat = fitz.Matrix(zoom, zoom)
    
    for unit in range(1, total_units + 1):
        theory_idx = start_page_idx + (unit - 1) * 2
        exercise_idx = theory_idx + 1
        
        print(f"Extracting Unit {unit}...")
        
        # Extract Theory
        theory_page = doc[theory_idx]
        theory_pix = theory_page.get_pixmap(matrix=mat)
        theory_path = os.path.join(OUT_DIR, f"unit_{unit}.png")
        theory_pix.save(theory_path)
        
        # Extract Exercises
        exercise_page = doc[exercise_idx]
        exercise_pix = exercise_page.get_pixmap(matrix=mat)
        exercise_path = os.path.join(OUT_DIR, f"unit_{unit}_exercises.png")
        exercise_pix.save(exercise_path)
        
    print(f"\nDone! Extracted {total_units} theory and {total_units} exercise images.")
    print(f"Images saved to: {OUT_DIR}")

if __name__ == "__main__":
    extract_images()
