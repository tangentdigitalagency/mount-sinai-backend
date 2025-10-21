# Enhanced Sources Example

## Sample AI Response with Detailed Sources

### User Question

"What does John 3:16 mean and what are the key theological concepts?"

### AI Response

```json
{
  "success": true,
  "data": {
    "aiResponse": "John 3:16 is one of the most well-known verses in the Bible, often called the 'Gospel in a nutshell.' This verse reveals several key theological concepts...",
    "metadata": {
      "versesCited": ["John 3:16", "Romans 5:8", "Ephesians 2:8-9"],
      "sourcesCited": [
        "Systematic Theology by Wayne Grudem",
        "ESV Study Bible by Crossway",
        "Blue Letter Bible by Blue Letter Bible"
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
        },
        {
          "title": "Blue Letter Bible",
          "author": "Blue Letter Bible",
          "type": "online_resource",
          "description": "Free online Bible study tools with commentaries, lexicons, and concordances.",
          "url": "https://www.blueletterbible.org/",
          "relevance": 0.9
        }
      ],
      "theologicalTopics": ["salvation", "grace", "eternal life", "faith"],
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

  <div class="sources">
    <h4>Sources</h4>

    <div class="source-item">
      <div class="source-header">
        <h5>Systematic Theology</h5>
        <span class="source-type">book</span>
      </div>
      <div class="source-details">
        <p><strong>Author:</strong> Wayne Grudem</p>
        <p>
          <strong>Description:</strong> Comprehensive systematic theology
          covering all major Christian doctrines with biblical foundations.
        </p>
        <p><strong>Publisher:</strong> Zondervan</p>
        <p><strong>Year:</strong> 1994</p>
        <p><strong>ISBN:</strong> 978-0310286707</p>
        <p><strong>Relevance:</strong> 95%</p>
      </div>
    </div>

    <div class="source-item">
      <div class="source-header">
        <h5>
          <a href="https://www.esv.org/study-bible/" target="_blank"
            >ESV Study Bible</a
          >
        </h5>
        <span class="source-type">study_bible</span>
      </div>
      <div class="source-details">
        <p><strong>Author:</strong> Crossway</p>
        <p>
          <strong>Description:</strong> Comprehensive study Bible with extensive
          notes, maps, and articles.
        </p>
        <p><strong>Publisher:</strong> Crossway</p>
        <p><strong>Year:</strong> 2008</p>
        <p><strong>ISBN:</strong> 978-1433502415</p>
        <p><strong>Relevance:</strong> 95%</p>
      </div>
    </div>

    <div class="source-item">
      <div class="source-header">
        <h5>
          <a href="https://www.blueletterbible.org/" target="_blank"
            >Blue Letter Bible</a
          >
        </h5>
        <span class="source-type">online_resource</span>
      </div>
      <div class="source-details">
        <p><strong>Author:</strong> Blue Letter Bible</p>
        <p>
          <strong>Description:</strong> Free online Bible study tools with
          commentaries, lexicons, and concordances.
        </p>
        <p><strong>Relevance:</strong> 90%</p>
      </div>
    </div>
  </div>
</div>
```

## Key Benefits

### 1. **Clickable Links**

- Online resources have direct links
- Users can immediately access study materials
- No need to search for sources manually

### 2. **Detailed Information**

- Publisher and year information
- ISBN for easy book purchasing
- Descriptions help users understand what each source covers

### 3. **Source Quality Indicators**

- Relevance scores show source importance
- Source types help users choose appropriate materials
- Confidence scores indicate AI certainty

### 4. **Educational Value**

- Users learn about trusted theological sources
- Descriptions help users understand source content
- Builds theological library knowledge

## Implementation Notes

- **Backward Compatible**: `sourcesCited` array still provided
- **Optional**: `detailedSources` can be ignored if not needed
- **Sorted**: Sources are ordered by relevance score
- **Comprehensive**: Includes books, study Bibles, and online resources

The enhanced source system provides users with **immediate access to trusted theological resources** for deeper study! 📚✨
