import os
import shutil
import json
import zipfile
from pathlib import Path
import re

# paths
SOURCE_DIR = "/Users/pasha/Library/CloudStorage/GoogleDrive-pashkinzonch@gmail.com/My Drive/03. Semester 4/"
BASE_DIR = Path(__file__).resolve().parent.parent
PDF_DIR = BASE_DIR / "pdfs"
DOWNLOADS_DIR = BASE_DIR / "downloads"
DATA_DIR = BASE_DIR / "data"

SUBJECT_MAP = {
    "01.02 Analyse 2 Prüfungsvorbereitung PDFs": {"slug": "analyse-2", "name": "Analyse 2"},
    "02.02 Datenstrukturen 1 Prüfungsvorbereitung PDFs": {"slug": "datenstrukturen-1", "name": "Datenstrukturen 1"},
    "03.02 Lineare Algebra 2 Prüfungsvorbereitung PDFs": {"slug": "lineare-algebra-2", "name": "Lineare Algebra 2"},
    "04.02 Numerik 0 Prüfungsvorbereitung PDFs": {"slug": "numerik-0", "name": "Numerik 0"},
    "05.02 Statistik 0 Prüfungsvorbereitung PDFs": {"slug": "statistik-0", "name": "Statistik 0"}
}

def sanitize_filename(filename):
    """Make filename URL and file-system safe while readable."""
    name, ext = os.path.splitext(filename)
    # Replace umlauts
    name = name.replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue')
    name = name.replace('Ä', 'Ae').replace('Ö', 'Oe').replace('Ü', 'Ue').replace('ß', 'ss')
    # Remove special characters except alphanumeric, dashes, spaces, underscores
    name = re.sub(r'[^a-zA-Z0-9\s_-]', '', name)
    # Replace spaces with dashes
    name = re.sub(r'\s+', '-', name)
    return f"{name.strip('-')}{ext}"

def get_readable_title(filename):
    """Generate a readable title from the original filename."""
    name, _ = os.path.splitext(filename)
    return name.strip()

def format_size(size_bytes):
    """Format bytes to human-readable string."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"

def main():
    print("Starting PDF generation...")
    
    # Ensure directories exist and are clean
    for d in [PDF_DIR, DOWNLOADS_DIR, DATA_DIR]:
        if d.exists():
            shutil.rmtree(d)
        d.mkdir(parents=True, exist_ok=True)
    
    all_pdfs_json = []
    summary = {}
    all_pdf_paths = []

    for src_folder, info in SUBJECT_MAP.items():
        slug = info["slug"]
        subj_name = info["name"]
        src_path = Path(SOURCE_DIR) / src_folder
        
        target_subj_dir = PDF_DIR / slug
        target_subj_dir.mkdir(parents=True, exist_ok=True)
        
        pdf_count = 0
        subject_pdfs = []
        
        if src_path.exists():
            # Find all PDFs in the source folder
            for pdf_file in src_path.glob("*.pdf"):
                orig_name = pdf_file.name
                clean_name = sanitize_filename(orig_name)
                title = get_readable_title(orig_name)
                
                target_path = target_subj_dir / clean_name
                shutil.copy2(pdf_file, target_path)
                
                stat = target_path.stat()
                file_size = stat.st_size
                
                pdf_info = {
                    "title": title,
                    "subject": subj_name,
                    "subjectSlug": slug,
                    "path": f"pdfs/{slug}/{clean_name}",
                    "size": format_size(file_size),
                    "sizeBytes": file_size,
                    "lastModified": stat.st_mtime
                }
                
                subject_pdfs.append(pdf_info)
                all_pdfs_json.append(pdf_info)
                all_pdf_paths.append(target_path)
                pdf_count += 1
                
        # Create ZIP for the subject
        if subject_pdfs:
            zip_path = DOWNLOADS_DIR / f"{slug}.zip"
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
                for pdf in subject_pdfs:
                    local_path = BASE_DIR / pdf['path']
                    zf.write(local_path, arcname=local_path.name)
            
            # Update target paths for downloading subject ZIP
            for pdf in subject_pdfs:
                pdf["subjectZip"] = f"downloads/{slug}.zip"
                
        summary[subj_name] = pdf_count
        print(f"[{subj_name}] Copied {pdf_count} PDFs and created zip.")

    # Create global ZIP
    if all_pdf_paths:
        global_zip_path = DOWNLOADS_DIR / "all-pdfs.zip"
        with zipfile.ZipFile(global_zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            for pdf_path in all_pdf_paths:
                # Store in folder structure inside zip: slug/filename
                arcname = f"{pdf_path.parent.name}/{pdf_path.name}"
                zf.write(pdf_path, arcname=arcname)
        print("Created global all-pdfs.zip")

    # Write JSON
    json_path = DATA_DIR / "pdfs.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(all_pdfs_json, f, ensure_ascii=False, indent=2)
        
    print(f"\nCreated JSON manifest at: {json_path}")
    print("\n--- Summary ---")
    for subj, count in summary.items():
        print(f"- {subj}: {count} PDFs")

if __name__ == "__main__":
    main()
