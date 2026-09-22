#!/usr/bin/env python3
"""Regression checks for UI contracts that must survive CSS compilation."""

from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]


def check_compiled_responsive_contract(problems):
    css = (ROOT / "assets/bundle.min.css").read_text(encoding="utf-8")
    required = {
        r".sm\:grid-cols-3": "tablet leadership columns",
        ".aspect-square": "stable portrait geometry",
        r".sm\:py-32": "partner section responsive spacing",
    }
    for selector, behavior in required.items():
        if selector not in css:
            problems.append(f"bundle missing {selector} ({behavior})")


def check_leadership_contract(problems):
    html = (ROOT / "about.html").read_text(encoding="utf-8")
    css = (ROOT / "assets/skin.css").read_text(encoding="utf-8")
    for class_name in (
        "leadership-spotlight",
        "leadership-team-grid",
        "leadership-card",
        "leadership-photo",
    ):
        if f'class="{class_name}' not in html and f" {class_name}" not in html:
            problems.append(f"About leadership missing .{class_name}")
        if f".{class_name}" not in css:
            problems.append(f"skin.css missing .{class_name}")
    if "--anchor-offset:104px" not in css.replace(" ", ""):
        problems.append("skin.css does not define the sticky-header anchor offset")


def check_authored_style_policy(problems):
    paths = [
        ROOT / "about.html",
        ROOT / "index.html",
        ROOT / "assets/brand-marquee.js",
        ROOT / "assets/skin.css",
    ]
    forbidden_colors = ("#8b5cf6", "#6366f1", "#ec4899", "#db2777", "#f9a8d4")
    for path in paths:
        source = path.read_text(encoding="utf-8").lower()
        if "transition: all" in source or "transition:all" in source:
            problems.append(f"{path.relative_to(ROOT)} uses transition: all")
        for color in forbidden_colors:
            if color in source:
                problems.append(f"{path.relative_to(ROOT)} uses non-palette color {color}")


def main():
    problems = []
    check_compiled_responsive_contract(problems)
    check_leadership_contract(problems)
    check_authored_style_policy(problems)
    if problems:
        print(f"{len(problems)} UI contract problem(s):")
        for problem in problems:
            print(f"  {problem}")
        return 1
    print("OK: UI contracts pass.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
