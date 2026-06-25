import os
import glob

directory = r"c:\Users\Vishnu\.gemini\antigravity\scratch\Sterling Hotel"
html_files = glob.glob(os.path.join(directory, "*.html"))

replacements = {
    "₹2,500": "₹2,600",
    "₹500<": "₹600<",
    "(₹500/n)": "(₹600/n)",
    "price: '₹500'": "price: '₹600'",
    "Elegant living and dining spaces, private balcony, premium marble bath, and custom local wood furnishings.": "Luxury and space combined for a premium stay experience. Ideal for families, executives, and extended stays.",
    "Luxurious contemporary room with botanical garden views, plush bedding, executive desk, and modern en-suite.": "Comfortable and elegant rooms designed for a relaxing stay. Perfect for business travelers, couples, and tourists.",
    "Clean, modern shared sanctuary featuring comfortable single beds, personal lockers, and shared bath facilities.": "Affordable comfort for groups, students, backpackers, and budget travelers.",
}

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)

    if content != new_content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")
