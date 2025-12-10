#!/usr/bin/env python3
import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path


def find_pdf2htmlex(custom_path: str | None = None) -> str:
    """
    Find pdf2htmlEX executable.

    Priority:
    1. Explicit --bin path from user
    2. System PATH (pdf2htmlEX / pdf2htmlEX.exe)
    """
    if custom_path:
        exe_path = Path(custom_path)
        if exe_path.is_file():
            return str(exe_path)
        raise FileNotFoundError(
            f"pdf2htmlEX not found at given path: {custom_path}"
        )

    # Try to locate in PATH
    for name in ("pdf2htmlEX", "pdf2htmlEX.exe"):
        found = shutil.which(name)
        if found:
            return found

    raise FileNotFoundError(
        "Could not find 'pdf2htmlEX' in PATH.\n"
        "👉 Either:\n"
        "  1) Install pdf2htmlEX and add it to PATH, or\n"
        "  2) Use --bin PATH_TO_pdf2htmlEX.exe"
    )


def convert_single_pdf(pdf2htmlex_bin: str, input_pdf: Path, output_dir: Path) -> Path:
    """
    Convert a single PDF to HTML using pdf2htmlEX.
    Returns the path to the generated HTML file.
    """
    if not input_pdf.is_file():
        raise FileNotFoundError(f"Input PDF not found: {input_pdf}")

    output_dir.mkdir(parents=True, exist_ok=True)

    # Output HTML file name based on PDF name
    output_html = output_dir / (input_pdf.stem + ".html")

    # Build command
    cmd = [
        pdf2htmlex_bin,
        "--zoom", "1.3",        # tweakable: scale for readability
        str(input_pdf),
        str(output_html),
    ]

    print(f"\n➡ Converting: {input_pdf}")
    print(f"   Output    : {output_html}")
    # Run the process
    try:
        result = subprocess.run(
            cmd,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )
        # Optional: print limited output
        print("   ✅ Done")
        # Uncomment for debugging:
        # print(result.stdout)
    except subprocess.CalledProcessError as e:
        print("   ❌ Conversion failed!")
        print("   Command:", " ".join(cmd))
        print("   Output:")
        print(e.stdout)
        raise

    return output_html


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Convert PDF to HTML (layout-accurate) using pdf2htmlEX."
    )
    parser.add_argument(
        "pdfs",
        nargs="+",
        help="Input PDF file(s) to convert.",
    )
    parser.add_argument(
        "-o", "--output-dir",
        default="html_output",
        help="Directory where HTML files will be saved (default: html_output).",
    )
    parser.add_argument(
        "--bin",
        help="Path to pdf2htmlEX executable (if not in PATH).",
    )

    args = parser.parse_args(argv)

    try:
        pdf2htmlex_bin = find_pdf2htmlex(args.bin)
    except FileNotFoundError as e:
        print("\n[ERROR]", e)
        return 1

    output_dir = Path(args.output_dir).resolve()
    print(f"Using pdf2htmlEX: {pdf2htmlex_bin}")
    print(f"Output directory: {output_dir}")

    converted_files: list[Path] = []

    for pdf in args.pdfs:
        try:
            html_path = convert_single_pdf(
                pdf2htmlex_bin,
                Path(pdf).resolve(),
                output_dir,
            )
            converted_files.append(html_path)
        except Exception as e:
            print(f"   Skipped {pdf} due to error: {e}")

    if converted_files:
        print("\n✅ Conversion finished. Generated HTML files:")
        for f in converted_files:
            print(f"   - {f}")
        return 0
    else:
        print("\n❌ No files were successfully converted.")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
