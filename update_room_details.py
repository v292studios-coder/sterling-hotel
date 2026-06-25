import os

file_path = r"c:\Users\Vishnu\.gemini\antigravity\scratch\Sterling Hotel\room-detail.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace suite description and price
content = content.replace("price: '₹2,500'", "price: '₹2,600'")
content = content.replace(
    "desc: 'Elegant living and dining spaces, private balcony, premium marble bath, and custom local wood furnishings.'",
    "desc: 'Luxury and space combined for a premium stay experience. Ideal for families, executives, and extended stays.'"
)

# Replace deluxe description
content = content.replace(
    "desc: 'Luxurious contemporary room with botanical garden views, plush bedding, executive desk, and modern en-suite.'",
    "desc: 'Comfortable and elegant rooms designed for a relaxing stay. Perfect for business travelers, couples, and tourists.'"
)

# Replace dormitory description and price
content = content.replace("price: '₹500'", "price: '₹600'")
content = content.replace(
    "desc: 'Clean, modern shared sanctuary featuring comfortable single beds, personal lockers, and shared bath facilities.'",
    "desc: 'Affordable comfort for groups, students, backpackers, and budget travelers.'"
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated room-detail.html")
