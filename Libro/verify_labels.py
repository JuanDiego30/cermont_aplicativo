from __future__ import annotations

import re
from pathlib import Path


LABEL_RE = re.compile(r"\\label\{([^}]+)\}")
REF_RE = re.compile(r"\\(?:ref|pageref|autoref)\{([^}]+)\}")


def scan_tex_files(root: Path) -> tuple[dict[str, list[str]], dict[str, list[str]]]:
    labels: dict[str, list[str]] = {}
    refs: dict[str, list[str]] = {}

    for tex_file in sorted(root.rglob("*.tex")):
        content = tex_file.read_text(encoding="utf-8", errors="ignore")
        rel = tex_file.relative_to(root).as_posix()
        labels[rel] = LABEL_RE.findall(content)
        refs[rel] = REF_RE.findall(content)

    return labels, refs


def main() -> None:
    root = Path(__file__).resolve().parent
    labels_by_file, refs_by_file = scan_tex_files(root)

    all_labels = {label for labels in labels_by_file.values() for label in labels}

    print("LABELS DEFINIDOS")
    for file_name, labels in labels_by_file.items():
        if labels:
            print(f"- {file_name}: {', '.join(labels)}")

    print("\nREFERENCIAS USADAS")
    broken: list[tuple[str, str]] = []
    for file_name, refs in refs_by_file.items():
        if refs:
            print(f"- {file_name}: {', '.join(refs)}")
        for ref in refs:
            if ref not in all_labels:
                broken.append((file_name, ref))

    print("\nREFERENCIAS ROTAS")
    if not broken:
        print("- Ninguna")
        return

    for file_name, ref in broken:
        print(f"- {file_name}: {ref}")


if __name__ == "__main__":
    main()
