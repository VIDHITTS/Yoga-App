import json
import re

# Read the current knowledge base
with open('../data/yoga_knowledge.json', 'r', encoding='utf-8') as f:
    articles = json.load(f)

# Function to split content into info and precautions
def split_content(content):
    # Look for contraindications, precautions, avoid patterns
    patterns = [
        r'Contraindications?:\s*(.+?)(?:\.|$)',
        r'Precautions?:\s*(.+?)(?:\.|$)',
        r'Avoid if (.+?)(?:\.|$)',
        r'Not recommended for (.+?)(?:\.|$)',
    ]
    
    precautions_text = ""
    info_text = content
    
    # Try to find and extract precautions
    for pattern in patterns:
        matches = re.finditer(pattern, content, re.IGNORECASE | re.DOTALL)
        for match in matches:
            precautions_text += match.group(0) + " "
            info_text = info_text.replace(match.group(0), "").strip()
    
    # Clean up
    info_text = re.sub(r'\s+', ' ', info_text).strip()
    precautions_text = precautions_text.strip()
    
    # If no precautions found, provide general ones based on article type
    if not precautions_text:
        if any(word in content.lower() for word in ['pregnant', 'pregnancy']):
            precautions_text = "Consult a healthcare provider before practicing if you have any medical conditions."
        else:
            precautions_text = "Practice under guidance if you are a beginner. Stop if you experience pain or discomfort."
    
    return info_text, precautions_text

# Restructure all articles
restructured_articles = []

for article in articles:
    if 'content' in article:
        info, precautions = split_content(article['content'])
        
        restructured_article = {
            "id": article['id'],
            "title": article['title'],
            "source": article['source'],
            "page": article['page'],
            "info": info,
            "precautions": precautions
        }
        restructured_articles.append(restructured_article)
    else:
        # Already restructured or missing content
        restructured_articles.append(article)

# Write the restructured knowledge base
with open('../data/yoga_knowledge_restructured.json', 'w', encoding='utf-8') as f:
    json.dump(restructured_articles, f, indent=2, ensure_ascii=False)

print(f"✅ Successfully restructured {len(restructured_articles)} articles")
print("📁 Output saved to: yoga_knowledge_restructured.json")
