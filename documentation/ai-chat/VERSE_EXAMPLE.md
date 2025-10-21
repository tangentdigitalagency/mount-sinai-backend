# Enhanced Verses Example

## Sample AI Response with Detailed Verse Information

### User Question

"What does John 3:16 mean and what other verses support this teaching?"

### AI Response

```json
{
  "success": true,
  "data": {
    "aiResponse": "John 3:16 is one of the most well-known verses in the Bible, often called the 'Gospel in a nutshell.' This verse reveals God's love and the way of salvation. Romans 5:8 and Ephesians 2:8-9 provide additional support for this teaching...",
    "metadata": {
      "versesCited": ["John 3:16", "Romans 5:8", "Ephesians 2:8-9"],
      "detailedVerses": [
        {
          "book": "John",
          "chapter": 3,
          "verse": 16,
          "version": "ESV",
          "fullReference": "John 3:16",
          "url": "https://www.biblegateway.com/passage/?search=John+3%3A16&version=ESV"
        },
        {
          "book": "Romans",
          "chapter": 5,
          "verse": 8,
          "version": "ESV",
          "fullReference": "Romans 5:8",
          "url": "https://www.biblegateway.com/passage/?search=Rom+5%3A8&version=ESV"
        },
        {
          "book": "Ephesians",
          "chapter": 2,
          "verse": 8,
          "version": "ESV",
          "fullReference": "Ephesians 2:8-9",
          "url": "https://www.biblegateway.com/passage/?search=Eph+2%3A8-9&version=ESV"
        }
      ],
      "sourcesCited": ["Systematic Theology by Wayne Grudem"],
      "detailedSources": [...],
      "theologicalTopics": ["salvation", "grace", "eternal life"],
      "confidence": 0.95
    },
    "formattedContent": {
      "text": "**John 3:16** is one of the most well-known verses in the Bible...",
      "format": "markdown"
    }
  }
}
```

## Frontend Display Example

### HTML Output

```html
<div class="message assistant">
  <div class="content">
    <p>
      <strong>John 3:16</strong> is one of the most well-known verses in the
      Bible...
    </p>
  </div>

  <div class="verses">
    <h4>Referenced Verses</h4>

    <div class="verse-item">
      <div class="verse-header">
        <h5>
          <a
            href="https://www.biblegateway.com/passage/?search=John+3%3A16&version=ESV"
            target="_blank"
            rel="noopener noreferrer"
            class="verse-link"
          >
            John 3:16
          </a>
        </h5>
        <span class="verse-version">ESV</span>
      </div>
      <div class="verse-details">
        <p><strong>Book:</strong> John</p>
        <p><strong>Chapter:</strong> 3</p>
        <p><strong>Verse:</strong> 16</p>
      </div>
    </div>

    <div class="verse-item">
      <div class="verse-header">
        <h5>
          <a
            href="https://www.biblegateway.com/passage/?search=Rom+5%3A8&version=ESV"
            target="_blank"
            rel="noopener noreferrer"
            class="verse-link"
          >
            Romans 5:8
          </a>
        </h5>
        <span class="verse-version">ESV</span>
      </div>
      <div class="verse-details">
        <p><strong>Book:</strong> Romans</p>
        <p><strong>Chapter:</strong> 5</p>
        <p><strong>Verse:</strong> 8</p>
      </div>
    </div>

    <div class="verse-item">
      <div class="verse-header">
        <h5>
          <a
            href="https://www.biblegateway.com/passage/?search=Eph+2%3A8-9&version=ESV"
            target="_blank"
            rel="noopener noreferrer"
            class="verse-link"
          >
            Ephesians 2:8-9
          </a>
        </h5>
        <span class="verse-version">ESV</span>
      </div>
      <div class="verse-details">
        <p><strong>Book:</strong> Ephesians</p>
        <p><strong>Chapter:</strong> 2</p>
        <p><strong>Verse:</strong> 8-9</p>
      </div>
    </div>
  </div>
</div>
```

## React Component Example

### Verse Reference Component

```typescript
import React from "react";

interface DetailedVerse {
  book: string;
  chapter: number;
  verse: number;
  version: string;
  fullReference: string;
  url?: string;
}

const VerseReference: React.FC<{ verse: DetailedVerse }> = ({ verse }) => {
  const handleVerseClick = () => {
    if (verse.url) {
      window.open(verse.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="verse-reference">
      <button
        onClick={handleVerseClick}
        className="verse-button"
        title={`Click to read ${verse.fullReference} in ${verse.version}`}
      >
        {verse.fullReference}
      </button>
      <span className="verse-version">{verse.version}</span>
    </div>
  );
};

const ChatMessage: React.FC<{ message: any }> = ({ message }) => {
  return (
    <div className="message">
      <div className="content">
        {message.formattedContent ? (
          <div
            dangerouslySetInnerHTML={{
              __html: markdownToHtml(message.formattedContent.text),
            }}
          />
        ) : (
          <div>{message.content}</div>
        )}
      </div>

      {message.metadata?.detailedVerses && (
        <div className="verses">
          <h4>Referenced Verses</h4>
          <div className="verse-list">
            {message.metadata.detailedVerses.map((verse, index) => (
              <VerseReference key={index} verse={verse} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

### CSS Styling

```css
.verse-reference {
  display: inline-flex;
  align-items: center;
  margin: 0.25rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.verse-reference:hover {
  background-color: #e9ecef;
  border-color: #28a745;
}

.verse-button {
  background: none;
  border: none;
  color: #28a745;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  padding: 0;
  margin-right: 0.5rem;
}

.verse-button:hover {
  text-decoration: underline;
  color: #1e7e34;
}

.verse-version {
  background-color: #6c757d;
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 500;
}

.verses {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #28a745;
}

.verse-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
```

## Advanced Features

### Verse Text Integration

```typescript
const useVerseText = () => {
  const [verseTexts, setVerseTexts] = useState<Record<string, string>>({});

  const fetchVerseText = async (verse: DetailedVerse) => {
    const key = `${verse.book}-${verse.chapter}-${verse.verse}`;

    if (verseTexts[key]) {
      return verseTexts[key];
    }

    try {
      const response = await fetch(
        `/api/bible/verse/${verse.book}/${verse.chapter}/${verse.verse}?version=${verse.version}`
      );
      const data = await response.json();

      setVerseTexts((prev) => ({
        ...prev,
        [key]: data.text,
      }));

      return data.text;
    } catch (error) {
      console.error("Error fetching verse text:", error);
      return null;
    }
  };

  return { fetchVerseText, verseTexts };
};
```

### Verse Analytics

```typescript
const useVerseAnalytics = () => {
  const trackVerseClick = (verse: DetailedVerse) => {
    // Track verse clicks for analytics
    analytics.track("verse_clicked", {
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      version: verse.version,
      timestamp: new Date().toISOString(),
    });
  };

  const trackVerseHover = (verse: DetailedVerse) => {
    // Track verse hovers for engagement metrics
    analytics.track("verse_hovered", {
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      version: verse.version,
    });
  };

  return { trackVerseClick, trackVerseHover };
};
```

## Key Benefits

### 1. **Clickable Verses**

- Direct links to Bible Gateway
- Easy access to verse context
- Multiple version support

### 2. **Detailed Metadata**

- Book, chapter, verse breakdown
- Version information
- Structured data for frontend use

### 3. **Enhanced User Experience**

- Visual verse indicators
- Hover effects and interactions
- Analytics tracking for study patterns

### 4. **Study Integration**

- Quick access to verse context
- Cross-reference capabilities
- Version comparison support

## Implementation Notes

- **Backward Compatible**: `versesCited` array still provided
- **Optional**: `detailedVerses` can be ignored if not needed
- **Performance**: Fast verse extraction with client-side URL generation
- **Extensible**: Easy to add new Bible versions and features

The enhanced verse system provides users with **clickable, detailed, and interactive** verse references for deeper Bible study! 📖✨
