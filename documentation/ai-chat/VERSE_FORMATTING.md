# Enhanced Verse Formatting and Metadata

## Overview

The AI Chat system now provides **detailed verse metadata** with clickable links, book/chapter/verse information, and Bible version support for enhanced user interaction.

## Enhanced Verse Information

### What's Included

Each verse now includes:

- **Book** name (e.g., "John", "Romans")
- **Chapter** number
- **Verse** number
- **Version** (e.g., "ESV", "NIV", "KJV")
- **Full Reference** (e.g., "John 3:16")
- **Clickable URL** to Bible Gateway
- **Optional Text** (for future verse text integration)

### Verse Types

#### 📖 Individual Verses

- Single verse references (e.g., John 3:16)
- Clickable links to specific verses
- Version-specific URLs

#### 📚 Verse Ranges

- Multiple verses (e.g., Romans 5:8-10)
- Chapter references (e.g., John 3)
- Book references (e.g., John)

## API Response Format

### Enhanced Metadata

```typescript
interface AIResponseMetadata {
  versesCited: string[]; // Simple list for backward compatibility
  detailedVerses: DetailedVerse[]; // NEW: Detailed verse information
  sourcesCited: string[];
  detailedSources: DetailedSource[];
  crossReferences: string[];
  theologicalTopics: string[];
  confidence: number;
}

interface DetailedVerse {
  book: string;
  chapter: number;
  verse: number;
  version: string;
  fullReference: string;
  text?: string;
  url?: string;
}
```

### Example Response

```json
{
  "success": true,
  "data": {
    "aiResponse": "John 3:16 is one of the most well-known verses in the Bible...",
    "metadata": {
      "versesCited": ["John 3:16", "Romans 5:8"],
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
        }
      ],
      "sourcesCited": ["Systematic Theology by Wayne Grudem"],
      "detailedSources": [...],
      "theologicalTopics": ["salvation", "grace"],
      "confidence": 0.95
    },
    "formattedContent": {
      "text": "**John 3:16** is one of the most well-known verses...",
      "format": "markdown"
    }
  }
}
```

## Frontend Implementation

### Displaying Clickable Verses

```typescript
const ChatMessage = ({ message }: { message: ChatMessage }) => {
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

      {/* Verses Section */}
      {message.metadata?.detailedVerses && (
        <div className="verses">
          <h4>Referenced Verses</h4>
          {message.metadata.detailedVerses.map((verse, index) => (
            <div key={index} className="verse-item">
              <div className="verse-header">
                <h5>
                  <a
                    href={verse.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="verse-link"
                  >
                    {verse.fullReference}
                  </a>
                </h5>
                <span className="verse-version">{verse.version}</span>
              </div>
              <div className="verse-details">
                <p>
                  <strong>Book:</strong> {verse.book}
                </p>
                <p>
                  <strong>Chapter:</strong> {verse.chapter}
                </p>
                <p>
                  <strong>Verse:</strong> {verse.verse}
                </p>
                {verse.text && (
                  <p>
                    <strong>Text:</strong> {verse.text}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### CSS Styling

```css
.verses {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #28a745;
}

.verse-item {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.verse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.verse-header h5 {
  margin: 0;
  color: #28a745;
}

.verse-link {
  color: #28a745;
  text-decoration: none;
  font-weight: 600;
}

.verse-link:hover {
  text-decoration: underline;
  color: #1e7e34;
}

.verse-version {
  background-color: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.verse-details p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #6c757d;
}

.verse-details strong {
  color: #495057;
}
```

## Bible Version Support

### Supported Versions

- **ESV** (English Standard Version) - Default
- **NIV** (New International Version)
- **KJV** (King James Version)
- **NASB** (New American Standard Bible)
- **NLT** (New Living Translation)
- **MSG** (The Message)

### Version URLs

Each verse gets a Bible Gateway URL with the specified version:

```
https://www.biblegateway.com/passage/?search=John+3%3A16&version=ESV
https://www.biblegateway.com/passage/?search=John+3%3A16&version=NIV
https://www.biblegateway.com/passage/?search=John+3%3A16&version=KJV
```

## Book Abbreviations

### Complete Book Mapping

The system includes abbreviations for all 66 books of the Bible:

#### Old Testament

- Genesis → Gen
- Exodus → Exod
- Leviticus → Lev
- Numbers → Num
- Deuteronomy → Deut
- Joshua → Josh
- Judges → Judg
- Ruth → Ruth
- 1 Samuel → 1Sam
- 2 Samuel → 2Sam
- 1 Kings → 1Kgs
- 2 Kings → 2Kgs
- 1 Chronicles → 1Chr
- 2 Chronicles → 2Chr
- Ezra → Ezra
- Nehemiah → Neh
- Esther → Esth
- Job → Job
- Psalms → Ps
- Proverbs → Prov
- Ecclesiastes → Eccl
- Song of Solomon → Song
- Isaiah → Isa
- Jeremiah → Jer
- Lamentations → Lam
- Ezekiel → Ezek
- Daniel → Dan
- Hosea → Hos
- Joel → Joel
- Amos → Amos
- Obadiah → Obad
- Jonah → Jonah
- Micah → Mic
- Nahum → Nah
- Habakkuk → Hab
- Zephaniah → Zeph
- Haggai → Hag
- Zechariah → Zech
- Malachi → Mal

#### New Testament

- Matthew → Matt
- Mark → Mark
- Luke → Luke
- John → John
- Acts → Acts
- Romans → Rom
- 1 Corinthians → 1Cor
- 2 Corinthians → 2Cor
- Galatians → Gal
- Ephesians → Eph
- Philippians → Phil
- Colossians → Col
- 1 Thessalonians → 1Thess
- 2 Thessalonians → 2Thess
- 1 Timothy → 1Tim
- 2 Timothy → 2Tim
- Titus → Titus
- Philemon → Phlm
- Hebrews → Heb
- James → Jas
- 1 Peter → 1Pet
- 2 Peter → 2Pet
- 1 John → 1John
- 2 John → 2John
- 3 John → 3John
- Jude → Jude
- Revelation → Rev

## Frontend Hooks and Utilities

### React Hook for Verse Handling

```typescript
const useVerseClick = () => {
  const handleVerseClick = (verse: DetailedVerse) => {
    // Open verse in new tab
    window.open(verse.url, "_blank", "noopener,noreferrer");

    // Track verse clicks for analytics
    analytics.track("verse_clicked", {
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      version: verse.version,
    });
  };

  const getVerseText = async (verse: DetailedVerse) => {
    // Future: Fetch actual verse text from Bible API
    try {
      const response = await fetch(
        `/api/bible/verse/${verse.book}/${verse.chapter}/${verse.verse}?version=${verse.version}`
      );
      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error("Error fetching verse text:", error);
      return null;
    }
  };

  return { handleVerseClick, getVerseText };
};
```

### Verse Component

```typescript
const VerseReference = ({ verse }: { verse: DetailedVerse }) => {
  const { handleVerseClick } = useVerseClick();

  return (
    <div className="verse-reference">
      <button onClick={() => handleVerseClick(verse)} className="verse-button">
        {verse.fullReference}
      </button>
      <span className="verse-version">{verse.version}</span>
    </div>
  );
};
```

## Benefits for Users

### 1. **Clickable Verses**

- Direct links to Bible Gateway
- Easy access to verse context
- Multiple version support

### 2. **Detailed Information**

- Book, chapter, verse breakdown
- Version information
- Structured metadata for frontend use

### 3. **Enhanced Study**

- Quick access to verse context
- Cross-reference capabilities
- Version comparison support

### 4. **User Experience**

- Visual verse indicators
- Hover effects and interactions
- Analytics tracking for study patterns

## Implementation Notes

### Backward Compatibility

- `versesCited` array still provided for existing frontend code
- `detailedVerses` is optional and can be ignored if not needed

### Performance

- Verse extraction is fast and efficient
- URLs are generated client-side
- No additional API calls needed for basic functionality

### Extensibility

- Easy to add new Bible versions
- Support for verse ranges and chapters
- Integration with Bible APIs for verse text

## Future Enhancements

### 1. **Verse Text Integration**

- Fetch actual verse text from Bible APIs
- Display verse text in tooltips or modals
- Support for multiple translations

### 2. **Advanced Features**

- Verse highlighting and notes
- Cross-reference suggestions
- Study plan integration

### 3. **User Preferences**

- Default Bible version selection
- Verse display preferences
- Study history tracking

The enhanced verse system provides users with **clickable, detailed, and interactive** verse references for deeper Bible study! 📖✨
