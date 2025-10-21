# AI Chat Sources and Citations

## Overview

The AI Chat system now provides **detailed source information** with clickable links, descriptions, and metadata for all theological sources cited in AI responses.

## Enhanced Source Information

### What's Included

Each source now includes:

- **Title** and **Author**
- **Type**: `book`, `commentary`, `study_bible`, `online_resource`
- **Description**: What the source covers
- **Publisher** and **Year**
- **ISBN** (for books)
- **URL** (for online resources)
- **Relevance Score**: 0-1 rating for how relevant to the topic

### Source Types

#### 📚 Books

- Systematic theologies
- Commentaries
- Historical works
- Modern theological texts

#### 📖 Study Bibles

- ESV Study Bible
- NIV Study Bible
- Other trusted study Bibles

#### 🌐 Online Resources

- Blue Letter Bible
- Bible Gateway
- Got Questions
- Ligonier Ministries

## API Response Format

### Enhanced Metadata

```typescript
interface AIResponseMetadata {
  versesCited: string[];
  sourcesCited: string[]; // Simple list for backward compatibility
  detailedSources: DetailedSource[]; // NEW: Detailed source information
  crossReferences: string[];
  theologicalTopics: string[];
  confidence: number;
}

interface DetailedSource {
  title: string;
  author: string;
  type: "book" | "commentary" | "study_bible" | "online_resource";
  url?: string;
  description: string;
  publisher?: string;
  year?: number;
  isbn?: string;
  relevance: number; // 0-1 score
}
```

### Example Response

```json
{
  "success": true,
  "data": {
    "aiResponse": "John 3:16 is one of the most well-known verses...",
    "metadata": {
      "versesCited": ["John 3:16", "Romans 5:8"],
      "sourcesCited": [
        "Systematic Theology by Wayne Grudem",
        "ESV Study Bible by Crossway"
      ],
      "detailedSources": [
        {
          "title": "Systematic Theology",
          "author": "Wayne Grudem",
          "type": "book",
          "description": "Comprehensive systematic theology covering all major Christian doctrines with biblical foundations.",
          "publisher": "Zondervan",
          "year": 1994,
          "isbn": "978-0310286707",
          "relevance": 0.95
        },
        {
          "title": "ESV Study Bible",
          "author": "Crossway",
          "type": "study_bible",
          "description": "Comprehensive study Bible with extensive notes, maps, and articles.",
          "publisher": "Crossway",
          "year": 2008,
          "isbn": "978-1433502415",
          "url": "https://www.esv.org/study-bible/",
          "relevance": 0.95
        }
      ],
      "theologicalTopics": ["salvation", "grace", "eternal life"],
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

### Displaying Sources

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

      {/* Sources Section */}
      {message.metadata?.detailedSources && (
        <div className="sources">
          <h4>Sources</h4>
          {message.metadata.detailedSources.map((source, index) => (
            <div key={index} className="source-item">
              <div className="source-header">
                <h5>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
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
                  <strong>Relevance:</strong>{" "}
                  {Math.round(source.relevance * 100)}%
                </p>
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
.sources {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.source-item {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.source-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.source-header h5 {
  margin: 0;
  color: #007bff;
}

.source-header h5 a {
  color: #007bff;
  text-decoration: none;
}

.source-header h5 a:hover {
  text-decoration: underline;
}

.source-type {
  background-color: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.source-details p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #6c757d;
}

.source-details strong {
  color: #495057;
}
```

## Source Categories

### Salvation & Grace

- **Systematic Theology** by Wayne Grudem
- **The Institutes of the Christian Religion** by John Calvin
- **Christian Theology** by Millard Erickson
- **What is Reformed Theology?** by R.C. Sproul

### Faith & Justification

- **Faith Alone** by R.C. Sproul
- **The Christian Faith** by Friedrich Schleiermacher

### Trinity

- **The Trinity** by St. Augustine
- **The Forgotten Trinity** by James White

### Church & Ministry

- **The Church** by Edmund Clowney
- **The Purpose Driven Church** by Rick Warren

### Study Bibles

- **ESV Study Bible** - Comprehensive notes and articles
- **NIV Study Bible** - Popular with detailed commentary

### Online Resources

- **Blue Letter Bible** - Free study tools and commentaries
- **Bible Gateway** - Multiple translations and study tools
- **Got Questions** - Christian apologetics Q&A
- **Ligonier Ministries** - Reformed theology resources

## Benefits for Users

### 1. **Clickable Sources**

- Direct links to online resources
- Easy access to study materials

### 2. **Detailed Information**

- Publisher and year information
- ISBN for easy book purchasing
- Relevance scores for source quality

### 3. **Source Types**

- Clear categorization (books, study Bibles, online resources)
- Visual indicators for different source types

### 4. **Educational Value**

- Descriptions help users understand what each source covers
- Relevance scores guide users to most helpful sources

## Implementation Notes

### Backward Compatibility

- `sourcesCited` array still provided for existing frontend code
- `detailedSources` is optional and can be ignored if not needed

### Performance

- Sources are cached and sorted by relevance
- Only most relevant sources are included in responses
- Online resources are always included for general study

### Extensibility

- Easy to add new sources to the database
- Source types can be extended as needed
- Relevance scoring can be improved with usage data

## Future Enhancements

### 1. **User Preferences**

- Allow users to favorite sources
- Personalized source recommendations
- Source reading history

### 2. **Source Ratings**

- User ratings for sources
- Community feedback on source quality
- Popular source tracking

### 3. **Integration**

- Direct integration with book purchasing
- Library system connections
- Digital resource access

The enhanced source system provides users with **comprehensive, clickable, and educational** source information to deepen their theological study! 📚✨
