import re
from pathlib import Path

def get_cited_keys(root: Path) -> set[str]:
    keys = set()
    # Scan all .tex files
    cite_re = re.compile(r"\\cite[a-zA-Z]*\*?\{([^}]+)\}")
    for tex_file in root.rglob("*.tex"):
        content = tex_file.read_text(encoding="utf-8", errors="ignore")
        for match in cite_re.finditer(content):
            for key in match.group(1).split(","):
                keys.add(key.strip())
                
    # Also scan all .aux files to be absolutely sure
    aux_re = re.compile(r"\\citation\{([^}]+)\}")
    for aux_file in root.rglob("*.aux"):
        content = aux_file.read_text(encoding="utf-8", errors="ignore")
        for match in aux_re.finditer(content):
            for key in match.group(1).split(","):
                keys.add(key.strip())
                
    return keys

def depurate_bib(root: Path, cited_keys: set[str]) -> None:
    bib_path = root / "Bibliografia" / "referencias.bib"
    if not bib_path.exists():
        print(f"Error: {bib_path} not found")
        return
        
    content = bib_path.read_text(encoding="utf-8", errors="ignore")
    
    # We want to match entries in the bib file.
    # An entry starts with @type{key,
    blocks = content.split("@")
    header = blocks[0] # Anything before the first @ (usually comments/preamble)
    
    kept_entries = []
    purged_count = 0
    kept_count = 0
    
    entry_re = re.compile(r"^([a-zA-Z]+)\s*\{\s*([^,\s]+)\s*,")
    
    for block in blocks[1:]:
        match = entry_re.search(block)
        if match:
            entry_type = match.group(1).lower()
            key = match.group(2)
            
            # Special entry types like comment, string, preamble don't have cite keys
            if entry_type in ["comment", "string", "preamble"]:
                kept_entries.append("@" + block)
            elif key in cited_keys:
                kept_entries.append("@" + block)
                kept_count += 1
            else:
                purged_count += 1
        else:
            # If it doesn't match standard entry structure, keep it to be safe
            kept_entries.append("@" + block)
            
    new_content = header + "".join(kept_entries)
    bib_path.write_text(new_content, encoding="utf-8")
    print(f"Bib depuration completed: kept {kept_count} entries, purged {purged_count} entries.")

if __name__ == "__main__":
    root = Path(__file__).resolve().parent
    cited = get_cited_keys(root)
    print(f"Found {len(cited)} unique cited keys in .tex/.aux files.")
    depurate_bib(root, cited)
