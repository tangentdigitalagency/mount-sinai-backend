# Frontend Quick Reference - Verse Integration

## 🚀 Quick Start

### 1. Check for Verse Metadata

```typescript
// Every AI message now includes verse metadata
if (message.metadata?.detailedVerses) {
  // Display verses with clickable links
}
```

### 2. Basic Verse Display

```typescript
const VerseButton = ({ verse }) => (
  <button onClick={() => window.open(verse.url, "_blank")}>
    {verse.fullReference}
  </button>
);
```

### 3. Complete Message Component

```typescript
const MessageComponent = ({ message }) => (
  <div className="message">
    <div className="content">{message.content}</div>

    {/* Verses */}
    {message.metadata?.detailedVerses?.map((verse) => (
      <VerseButton
        key={`${verse.book}-${verse.chapter}-${verse.verse}`}
        verse={verse}
      />
    ))}

    {/* Sources */}
    {message.metadata?.detailedSources?.map((source) => (
      <SourceLink key={source.title} source={source} />
    ))}
  </div>
);
```

## 📋 Data Structures

### Verse Object

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

### Source Object

```typescript
interface DetailedSource {
  title: string; // "ESV Study Bible"
  author: string; // "Crossway"
  type: string; // "study_bible"
  url?: string; // "https://www.esv.org/"
  description: string; // "Comprehensive study notes"
  relevance: number; // 0.9 (0-1 scale)
}
```

## 🎨 CSS Classes

### Verse Styling

```css
.verse-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.verse-button:hover {
  background: #2563eb;
}
```

### Source Styling

```css
.source-link {
  color: #0ea5e9;
  text-decoration: none;
  font-weight: 600;
}

.source-link:hover {
  text-decoration: underline;
}
```

## 🔧 Common Patterns

### 1. Verse with Analytics

```typescript
const VerseWithAnalytics = ({ verse }) => {
  const handleClick = () => {
    analytics.track("verse_clicked", {
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
    });
    window.open(verse.url, "_blank");
  };

  return (
    <button onClick={handleClick} className="verse-button">
      {verse.fullReference}
    </button>
  );
};
```

### 2. Source with Relevance

```typescript
const SourceWithRelevance = ({ source }) => (
  <div className="source-item">
    <a href={source.url} target="_blank" className="source-link">
      {source.title}
    </a>
    <span className="relevance">
      {Math.round(source.relevance * 100)}% relevant
    </span>
  </div>
);
```

### 3. Conditional Rendering

```typescript
const MessageDisplay = ({ message }) => {
  const hasVerses = message.metadata?.detailedVerses?.length > 0;
  const hasSources = message.metadata?.detailedSources?.length > 0;

  return (
    <div className="message">
      <div className="content">{message.content}</div>

      {hasVerses && (
        <div className="verses">
          <h4>Referenced Verses</h4>
          {message.metadata.detailedVerses.map((verse) => (
            <VerseButton key={verse.fullReference} verse={verse} />
          ))}
        </div>
      )}

      {hasSources && (
        <div className="sources">
          <h4>Sources</h4>
          {message.metadata.detailedSources.map((source) => (
            <SourceLink key={source.title} source={source} />
          ))}
        </div>
      )}
    </div>
  );
};
```

## 🚨 Error Handling

### Safe Access

```typescript
// Always use optional chaining
const verses = message.metadata?.detailedVerses || [];
const sources = message.metadata?.detailedSources || [];

// Check for existence before mapping
if (verses.length > 0) {
  verses.map((verse) => (
    <VerseButton key={verse.fullReference} verse={verse} />
  ));
}
```

### Fallback Display

```typescript
const SafeVerseDisplay = ({ message }) => {
  try {
    const verses = message.metadata?.detailedVerses || [];
    return verses.map((verse) => (
      <VerseButton key={verse.fullReference} verse={verse} />
    ));
  } catch (error) {
    console.error("Error displaying verses:", error);
    return <div>Error loading verses</div>;
  }
};
```

## 📊 Analytics Events

### Track Verse Clicks

```typescript
analytics.track("verse_clicked", {
  book: verse.book,
  chapter: verse.chapter,
  verse: verse.verse,
  version: verse.version,
  session_id: sessionId,
});
```

### Track Source Clicks

```typescript
analytics.track("source_clicked", {
  title: source.title,
  type: source.type,
  relevance: source.relevance,
  session_id: sessionId,
});
```

## 🎯 Key Benefits

- ✅ **Every verse is clickable** with Bible Gateway links
- ✅ **Rich metadata** for custom displays
- ✅ **Source information** with URLs and descriptions
- ✅ **Consistent structure** across all responses
- ✅ **No breaking changes** to existing code
- ✅ **Performance optimized** with proper error handling

## 🔍 What to Look For

### In API Responses

```json
{
  "metadata": {
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
    "detailedSources": [
      {
        "title": "ESV Study Bible",
        "author": "Crossway",
        "type": "study_bible",
        "url": "https://www.esv.org/",
        "relevance": 0.9
      }
    ]
  }
}
```

### In Console

```typescript
// Check if verses are being detected
console.log("Verses found:", message.metadata?.detailedVerses?.length || 0);
console.log("Sources found:", message.metadata?.detailedSources?.length || 0);
```

## 🚀 Implementation Checklist

- [ ] Check for `message.metadata?.detailedVerses`
- [ ] Display verses with clickable links
- [ ] Add CSS styling for verse buttons
- [ ] Handle missing metadata gracefully
- [ ] Add analytics tracking for verse clicks
- [ ] Test with different verse formats
- [ ] Implement source display (optional)
- [ ] Add error handling for edge cases

## 📞 Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify the API response includes `metadata.detailedVerses`
3. Ensure proper error handling for missing data
4. Test with different AI responses

The enhanced verse system is **fully backward compatible** - existing code will continue to work, but now you have access to rich verse metadata for enhanced user experiences! 🎉
