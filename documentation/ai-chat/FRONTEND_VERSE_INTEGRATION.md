# Frontend Verse Integration Guide

## Overview

The AI Chat system now provides **comprehensive verse detection and metadata** for every Bible verse mentioned in AI responses. This guide explains how to integrate and display these verses in your frontend application.

## API Response Format

### Enhanced Message Response

Every AI chat message now includes detailed verse metadata:

```json
{
  "id": "message-uuid",
  "session_id": "session-uuid",
  "role": "assistant",
  "content": "The famous verse [John 3:16] teaches us about God's love...",
  "formatted_content": {
    "text": "The famous verse [John 3:16] teaches us about God's love...",
    "format": "markdown"
  },
  "metadata": {
    "versesCited": ["John 3:16"],
    "detailedVerses": [
      {
        "book": "John",
        "chapter": 3,
        "verse": 16,
        "version": "ESV",
        "fullReference": "John 3:16",
        "url": "https://www.biblegateway.com/passage/?search=John+3%3A16&version=ESV"
      }
    ],
    "sourcesCited": ["ESV Study Bible", "Matthew Henry Commentary"],
    "detailedSources": [
      {
        "title": "ESV Study Bible",
        "author": "Crossway",
        "type": "study_bible",
        "url": "https://www.esv.org/",
        "description": "Comprehensive study notes and articles",
        "publisher": "Crossway",
        "year": 2008,
        "relevance": 0.9
      }
    ],
    "theologicalTopics": ["salvation", "love", "faith"],
    "crossReferences": ["Romans 5:8", "Ephesians 2:8-9"],
    "confidence": 0.8
  },
  "tokens_used": 150,
  "created_at": "2024-01-15T10:30:00Z"
}
```

## Verse Metadata Structure

### DetailedVerse Interface

```typescript
interface DetailedVerse {
  book: string; // "John"
  chapter: number; // 3
  verse: number; // 16
  version: string; // "ESV"
  fullReference: string; // "John 3:16"
  url: string; // Bible Gateway URL
}
```

### Source Metadata Structure

```typescript
interface DetailedSource {
  title: string; // "ESV Study Bible"
  author: string; // "Crossway"
  type: "book" | "commentary" | "study_bible" | "online_resource";
  url?: string; // "https://www.esv.org/"
  description: string; // "Comprehensive study notes"
  publisher?: string; // "Crossway"
  year?: number; // 2008
  isbn?: string; // "978-1433502415"
  relevance: number; // 0.9 (0-1 scale)
}
```

## Frontend Implementation

### 1. Basic Verse Display

```typescript
import React from "react";

interface MessageProps {
  message: {
    content: string;
    metadata?: {
      detailedVerses?: DetailedVerse[];
    };
  };
}

const MessageComponent: React.FC<MessageProps> = ({ message }) => {
  return (
    <div className="message">
      <div className="content">{message.content}</div>

      {/* Verses Section */}
      {message.metadata?.detailedVerses && (
        <div className="verses">
          <h4>Referenced Verses</h4>
          {message.metadata.detailedVerses.map((verse, index) => (
            <VerseReference key={index} verse={verse} />
          ))}
        </div>
      )}
    </div>
  );
};
```

### 2. Verse Reference Component

```typescript
import React from "react";

interface VerseReferenceProps {
  verse: DetailedVerse;
}

const VerseReference: React.FC<VerseReferenceProps> = ({ verse }) => {
  const handleVerseClick = () => {
    // Open Bible Gateway in new tab
    window.open(verse.url, "_blank", "noopener,noreferrer");

    // Optional: Track analytics
    analytics.track("verse_clicked", {
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      version: verse.version,
    });
  };

  return (
    <div className="verse-reference">
      <button
        onClick={handleVerseClick}
        className="verse-button"
        title={`View ${verse.fullReference} on Bible Gateway`}
      >
        {verse.fullReference}
      </button>

      <div className="verse-details">
        <span className="book">{verse.book}</span>
        <span className="chapter">{verse.chapter}</span>
        <span className="verse">{verse.verse}</span>
        <span className="version">{verse.version}</span>
      </div>
    </div>
  );
};
```

### 3. Enhanced Message Display

```typescript
import React from "react";
import { markdownToHtml } from "your-markdown-parser";

const EnhancedMessage: React.FC<MessageProps> = ({ message }) => {
  return (
    <div className="message assistant">
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
                <p>
                  <strong>Version:</strong> {verse.version}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sources Section */}
      {message.metadata?.detailedSources && (
        <div className="sources">
          <h4>Sources</h4>
          {message.metadata.detailedSources.map((source, index) => (
            <SourceItem key={index} source={source} />
          ))}
        </div>
      )}
    </div>
  );
};
```

### 4. Source Display Component

```typescript
interface SourceItemProps {
  source: DetailedSource;
}

const SourceItem: React.FC<SourceItemProps> = ({ source }) => {
  return (
    <div className="source-item">
      <div className="source-header">
        <h5>
          {source.url ? (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="source-link"
            >
              {source.title}
            </a>
          ) : (
            source.title
          )}
        </h5>
        <span className="source-type">{source.type}</span>
      </div>
      <div className="source-details">
        <p>
          <strong>Author:</strong> {source.author}
        </p>
        <p>
          <strong>Description:</strong> {source.description}
        </p>
        {source.publisher && (
          <p>
            <strong>Publisher:</strong> {source.publisher}
          </p>
        )}
        {source.year && (
          <p>
            <strong>Year:</strong> {source.year}
          </p>
        )}
        {source.isbn && (
          <p>
            <strong>ISBN:</strong> {source.isbn}
          </p>
        )}
        <p>
          <strong>Relevance:</strong> {Math.round(source.relevance * 100)}%
        </p>
      </div>
    </div>
  );
};
```

## CSS Styling

### Verse Styling

```css
.verse-reference {
  display: inline-block;
  margin: 4px 8px 4px 0;
}

.verse-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.verse-button:hover {
  background: #2563eb;
}

.verse-details {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.verse-details span {
  margin-right: 8px;
}

.verses {
  margin-top: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.verse-item {
  margin-bottom: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.verse-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
}

.verse-link:hover {
  text-decoration: underline;
}
```

### Source Styling

```css
.sources {
  margin-top: 16px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
  border-left: 4px solid #0ea5e9;
}

.source-item {
  margin-bottom: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.source-link {
  color: #0ea5e9;
  text-decoration: none;
  font-weight: 600;
}

.source-link:hover {
  text-decoration: underline;
}

.source-type {
  background: #e0f2fe;
  color: #0369a1;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
```

## Advanced Features

### 1. Verse Text Integration

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

### 2. Verse Analytics

```typescript
const useVerseAnalytics = () => {
  const trackVerseClick = (verse: DetailedVerse) => {
    analytics.track("verse_clicked", {
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      version: verse.version,
      timestamp: new Date().toISOString(),
    });
  };

  const trackVerseHover = (verse: DetailedVerse) => {
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

### 3. Verse Highlighting

```typescript
const VerseHighlighter: React.FC<{ verse: DetailedVerse }> = ({ verse }) => {
  const [isHighlighted, setIsHighlighted] = useState(false);

  const toggleHighlight = () => {
    setIsHighlighted(!isHighlighted);
    // Save to user's highlights
    saveUserHighlight(verse);
  };

  return (
    <div
      className={`verse-reference ${isHighlighted ? "highlighted" : ""}`}
      onClick={toggleHighlight}
    >
      <button className="verse-button">{verse.fullReference}</button>
    </div>
  );
};
```

## API Integration

### Fetching Messages

```typescript
const fetchMessages = async (sessionId: string) => {
  const response = await fetch(`/api/ai-chat/sessions/${sessionId}/messages`);
  const data = await response.json();

  return data.data; // Array of messages with metadata
};
```

### Real-time Updates

```typescript
const useRealtimeMessages = (sessionId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const newMessages = await fetchMessages(sessionId);
      setMessages(newMessages);
    }, 1000); // Poll every second

    return () => clearInterval(interval);
  }, [sessionId]);

  return messages;
};
```

## Error Handling

### Graceful Degradation

```typescript
const MessageComponent: React.FC<MessageProps> = ({ message }) => {
  // Handle missing metadata gracefully
  const verses = message.metadata?.detailedVerses || [];
  const sources = message.metadata?.detailedSources || [];

  return (
    <div className="message">
      <div className="content">{message.content}</div>

      {verses.length > 0 && (
        <div className="verses">
          {verses.map((verse, index) => (
            <VerseReference key={index} verse={verse} />
          ))}
        </div>
      )}

      {sources.length > 0 && (
        <div className="sources">
          {sources.map((source, index) => (
            <SourceItem key={index} source={source} />
          ))}
        </div>
      )}
    </div>
  );
};
```

## Testing

### Test Cases

```typescript
describe("Verse Integration", () => {
  it("should display verses with metadata", () => {
    const message = {
      content: "The famous verse [John 3:16] teaches us...",
      metadata: {
        detailedVerses: [
          {
            book: "John",
            chapter: 3,
            verse: 16,
            version: "ESV",
            fullReference: "John 3:16",
            url: "https://www.biblegateway.com/passage/?search=John+3%3A16&version=ESV",
          },
        ],
      },
    };

    render(<MessageComponent message={message} />);

    expect(screen.getByText("John 3:16")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      expect.stringContaining("biblegateway.com")
    );
  });
});
```

## Performance Considerations

### Lazy Loading

```typescript
const LazyVerseReference = React.lazy(() => import("./VerseReference"));

const MessageComponent: React.FC<MessageProps> = ({ message }) => {
  return (
    <div className="message">
      <div className="content">{message.content}</div>

      {message.metadata?.detailedVerses && (
        <Suspense fallback={<div>Loading verses...</div>}>
          <LazyVerseReference verses={message.metadata.detailedVerses} />
        </Suspense>
      )}
    </div>
  );
};
```

### Memoization

```typescript
const VerseReference = React.memo<VerseReferenceProps>(({ verse }) => {
  return (
    <div className="verse-reference">
      <button onClick={() => window.open(verse.url, "_blank")}>
        {verse.fullReference}
      </button>
    </div>
  );
});
```

## Summary

The enhanced verse system provides:

- ✅ **Every verse detected** with detailed metadata
- ✅ **Clickable Bible Gateway links** for all verses
- ✅ **Rich source information** with URLs and descriptions
- ✅ **Consistent data structure** across all responses
- ✅ **Easy integration** with existing frontend code
- ✅ **Performance optimized** with lazy loading and memoization

The frontend now receives comprehensive verse and source metadata for every AI response, enabling rich, interactive Bible study experiences! 📖✨
