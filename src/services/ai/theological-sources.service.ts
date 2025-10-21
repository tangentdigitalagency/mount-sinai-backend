import { logger } from "../../utils/logger";

/**
 * Service for managing trusted theological sources and biblical cross-references
 */
export class TheologicalSourcesService {
  /**
   * Find cross-references for given verse references
   */
  async findCrossReferences(verseReferences: string[]): Promise<string[]> {
    try {
      const crossReferences: string[] = [];

      for (const verse of verseReferences) {
        const references = await this.getCrossReferencesForVerse(verse);
        crossReferences.push(...references);
      }

      return [...new Set(crossReferences)]; // Remove duplicates
    } catch (error) {
      logger.error("Error finding cross-references:", error);
      return [];
    }
  }

  /**
   * Get citable theological sources for given topics with detailed information
   */
  async getCitableSources(topics: string[]): Promise<{
    sources: string[];
    detailedSources: Array<{
      title: string;
      author: string;
      type: "book" | "commentary" | "study_bible" | "online_resource";
      url?: string;
      description: string;
      publisher?: string;
      year?: number;
      isbn?: string;
      relevance: number; // 0-1 score for how relevant to the topic
    }>;
  }> {
    try {
      const sources: string[] = [];
      const detailedSources: Array<{
        title: string;
        author: string;
        type: "book" | "commentary" | "study_bible" | "online_resource";
        url?: string;
        description: string;
        publisher?: string;
        year?: number;
        isbn?: string;
        relevance: number;
      }> = [];

      // Enhanced source database with detailed information
      const sourceDatabase = {
        salvation: [
          {
            title: "Systematic Theology",
            author: "Wayne Grudem",
            type: "book" as const,
            description:
              "Comprehensive systematic theology covering all major Christian doctrines with biblical foundations.",
            publisher: "Zondervan",
            year: 1994,
            isbn: "978-0310286707",
            relevance: 0.95,
          },
          {
            title: "The Institutes of the Christian Religion",
            author: "John Calvin",
            type: "book" as const,
            description:
              "Classic work of Reformed theology, foundational text for understanding salvation and grace.",
            publisher: "Westminster John Knox Press",
            year: 1559,
            isbn: "978-0664220280",
            relevance: 0.9,
          },
          {
            title: "Christian Theology",
            author: "Millard Erickson",
            type: "book" as const,
            description:
              "Evangelical systematic theology with balanced approach to doctrinal issues.",
            publisher: "Baker Academic",
            year: 2013,
            isbn: "978-0801036374",
            relevance: 0.85,
          },
        ],
        grace: [
          {
            title: "What is Reformed Theology?",
            author: "R.C. Sproul",
            type: "book" as const,
            description:
              "Clear explanation of Reformed theology and the doctrine of grace.",
            publisher: "Baker Books",
            year: 2016,
            isbn: "978-0801019254",
            relevance: 0.9,
          },
          {
            title: "The Grace of God",
            author: "Andy Stanley",
            type: "book" as const,
            description:
              "Practical exploration of God's grace in everyday life.",
            publisher: "Zondervan",
            year: 2010,
            isbn: "978-0310321928",
            relevance: 0.8,
          },
        ],
        faith: [
          {
            title: "Faith Alone",
            author: "R.C. Sproul",
            type: "book" as const,
            description:
              "Defense of the doctrine of justification by faith alone.",
            publisher: "Baker Books",
            year: 2016,
            isbn: "978-0801019254",
            relevance: 0.9,
          },
          {
            title: "The Christian Faith",
            author: "Friedrich Schleiermacher",
            type: "book" as const,
            description: "Influential work on Christian doctrine and faith.",
            publisher: "Fortress Press",
            year: 2016,
            isbn: "978-1506406808",
            relevance: 0.7,
          },
        ],
        trinity: [
          {
            title: "The Trinity",
            author: "St. Augustine",
            type: "book" as const,
            description:
              "Classic work on the doctrine of the Trinity by the great Church Father.",
            publisher: "New City Press",
            year: 1991,
            isbn: "978-1565484463",
            relevance: 0.95,
          },
          {
            title: "The Forgotten Trinity",
            author: "James White",
            type: "book" as const,
            description:
              "Modern defense of the Trinity doctrine with biblical and historical evidence.",
            publisher: "Bethany House",
            year: 1998,
            isbn: "978-0764221824",
            relevance: 0.9,
          },
        ],
        church: [
          {
            title: "The Church",
            author: "Edmund Clowney",
            type: "book" as const,
            description: "Biblical theology of the church and its mission.",
            publisher: "InterVarsity Press",
            year: 1995,
            isbn: "978-0830815244",
            relevance: 0.85,
          },
          {
            title: "The Purpose Driven Church",
            author: "Rick Warren",
            type: "book" as const,
            description: "Practical guide to church growth and ministry.",
            publisher: "Zondervan",
            year: 1995,
            isbn: "978-0310201069",
            relevance: 0.8,
          },
        ],
        bible_study: [
          {
            title: "ESV Study Bible",
            author: "Crossway",
            type: "study_bible" as const,
            description:
              "Comprehensive study Bible with extensive notes, maps, and articles.",
            publisher: "Crossway",
            year: 2008,
            isbn: "978-1433502415",
            url: "https://www.esv.org/study-bible/",
            relevance: 0.95,
          },
          {
            title: "NIV Study Bible",
            author: "Zondervan",
            type: "study_bible" as const,
            description:
              "Popular study Bible with detailed commentary and study notes.",
            publisher: "Zondervan",
            year: 2011,
            isbn: "978-0310436110",
            url: "https://www.biblegateway.com/versions/New-International-Version-NIV-Bible/",
            relevance: 0.9,
          },
        ],
        online_resources: [
          {
            title: "Blue Letter Bible",
            author: "Blue Letter Bible",
            type: "online_resource" as const,
            description:
              "Free online Bible study tools with commentaries, lexicons, and concordances.",
            url: "https://www.blueletterbible.org/",
            relevance: 0.9,
          },
          {
            title: "Bible Gateway",
            author: "Bible Gateway",
            type: "online_resource" as const,
            description:
              "Free online Bible with multiple translations and study tools.",
            url: "https://www.biblegateway.com/",
            relevance: 0.85,
          },
          {
            title: "Got Questions",
            author: "Got Questions Ministries",
            type: "online_resource" as const,
            description: "Christian apologetics and Bible study Q&A resource.",
            url: "https://www.gotquestions.org/",
            relevance: 0.8,
          },
          {
            title: "Ligonier Ministries",
            author: "Ligonier Ministries",
            type: "online_resource" as const,
            description:
              "Reformed theology resources, articles, and teaching materials.",
            url: "https://www.ligonier.org/",
            relevance: 0.9,
          },
        ],
      };

      // Get sources for each topic
      topics.forEach((topic) => {
        const topicKey = topic.toLowerCase().replace(/\s+/g, "_");
        const topicSources =
          sourceDatabase[topicKey as keyof typeof sourceDatabase];

        if (topicSources) {
          topicSources.forEach((source) => {
            sources.push(`${source.title} by ${source.author}`);
            detailedSources.push(source);
          });
        }
      });

      // Always include some general online resources
      const generalResources = sourceDatabase.online_resources;
      generalResources.forEach((resource) => {
        if (!sources.includes(`${resource.title} by ${resource.author}`)) {
          sources.push(`${resource.title} by ${resource.author}`);
          detailedSources.push(resource);
        }
      });

      return {
        sources: [...new Set(sources)], // Remove duplicates
        detailedSources: detailedSources.sort(
          (a, b) => b.relevance - a.relevance
        ), // Sort by relevance
      };
    } catch (error) {
      logger.error("Error getting citable sources:", error);
      return { sources: [], detailedSources: [] };
    }
  }

  /**
   * Validate that a biblical claim is backed by Scripture
   */
  async validateBiblicalClaim(claim: string): Promise<{
    isValid: boolean;
    supportingVerses: string[];
    conflictingVerses: string[];
    confidence: number;
  }> {
    try {
      // This would typically use AI to analyze the claim
      // For now, we'll implement basic pattern matching
      const supportingVerses = this.findSupportingVerses(claim);
      const conflictingVerses = this.findConflictingVerses(claim);

      const confidence =
        supportingVerses.length > conflictingVerses.length ? 0.8 : 0.3;
      const isValid = confidence > 0.5;

      return {
        isValid,
        supportingVerses,
        conflictingVerses,
        confidence,
      };
    } catch (error) {
      logger.error("Error validating biblical claim:", error);
      return {
        isValid: false,
        supportingVerses: [],
        conflictingVerses: [],
        confidence: 0,
      };
    }
  }

  /**
   * Get trusted biblical commentaries for a passage
   */
  async getCommentariesForPassage(
    book: string,
    chapter: number,
    verse?: number
  ): Promise<{
    commentaries: string[];
    keyInsights: string[];
    historicalContext: string;
  }> {
    try {
      const commentaries = this.getCommentarySources(book);
      const keyInsights = this.getKeyInsights(book, chapter, verse);
      const historicalContext = this.getHistoricalContext(book, chapter);

      return {
        commentaries,
        keyInsights,
        historicalContext,
      };
    } catch (error) {
      logger.error("Error getting commentaries:", error);
      return {
        commentaries: [],
        keyInsights: [],
        historicalContext: "",
      };
    }
  }

  /**
   * Get theological themes for a passage
   */
  async getTheologicalThemes(
    book: string,
    chapter: number,
    verse?: number
  ): Promise<{
    primaryThemes: string[];
    secondaryThemes: string[];
    doctrinalConnections: string[];
  }> {
    try {
      const passage = `${book} ${chapter}${verse ? `:${verse}` : ""}`;

      const primaryThemes = this.getPrimaryThemes(passage);
      const secondaryThemes = this.getSecondaryThemes(passage);
      const doctrinalConnections = this.getDoctrinalConnections(passage);

      return {
        primaryThemes,
        secondaryThemes,
        doctrinalConnections,
      };
    } catch (error) {
      logger.error("Error getting theological themes:", error);
      return {
        primaryThemes: [],
        secondaryThemes: [],
        doctrinalConnections: [],
      };
    }
  }

  // Private helper methods

  private async getCrossReferencesForVerse(verse: string): Promise<string[]> {
    // This would typically query a cross-reference database
    // For now, we'll return some common cross-references
    const crossReferenceMap: Record<string, string[]> = {
      "John 3:16": ["Romans 5:8", "1 John 4:9", "Ephesians 2:8-9", "Titus 3:5"],
      "Romans 8:28": [
        "Genesis 50:20",
        "Jeremiah 29:11",
        "Philippians 1:6",
        "2 Corinthians 4:17",
      ],
      "Matthew 6:9": ["Luke 11:2", "Matthew 6:10-13", "Luke 11:1-4"],
    };

    return crossReferenceMap[verse] || [];
  }

  private findSupportingVerses(claim: string): string[] {
    // Basic pattern matching for common theological claims
    const claimPatterns: Record<string, string[]> = {
      "salvation by grace": ["Ephesians 2:8-9", "Romans 3:23-24", "Titus 3:5"],
      "Jesus is God": ["John 1:1", "John 10:30", "Colossians 2:9"],
      resurrection: ["1 Corinthians 15:3-4", "Romans 6:4", "1 Peter 1:3"],
    };

    const lowerClaim = claim.toLowerCase();
    for (const [pattern, verses] of Object.entries(claimPatterns)) {
      if (lowerClaim.includes(pattern)) {
        return verses;
      }
    }

    return [];
  }

  private findConflictingVerses(_claim: string): string[] {
    // This would identify verses that might conflict with the claim
    // For now, return empty array
    return [];
  }

  private getCommentarySources(book: string): string[] {
    const commentaryMap: Record<string, string[]> = {
      Genesis: [
        "The Genesis Record by Henry Morris",
        "Genesis: A Commentary by Bruce Waltke",
        "The Pentateuch by Gordon Wenham",
      ],
      Matthew: [
        "The Gospel According to Matthew by Leon Morris",
        "Matthew: A Commentary by Craig Keener",
        "The Gospel of Matthew by R.T. France",
      ],
      John: [
        "The Gospel According to John by Leon Morris",
        "John: A Commentary by Andreas Köstenberger",
        "The Gospel of John by D.A. Carson",
      ],
      Romans: [
        "Romans by Douglas Moo",
        "The Epistle to the Romans by Leon Morris",
        "Romans by Thomas Schreiner",
      ],
    };

    return (
      commentaryMap[book] || [
        "ESV Study Bible",
        "NIV Study Bible",
        "Reformation Study Bible",
      ]
    );
  }

  private getKeyInsights(
    book: string,
    chapter: number,
    _verse?: number
  ): string[] {
    // This would provide key insights for the specific passage
    return [
      `Historical context of ${book} chapter ${chapter}`,
      `Literary structure and themes`,
      `Theological significance`,
      `Practical application`,
    ];
  }

  private getHistoricalContext(book: string, _chapter: number): string {
    const contextMap: Record<string, string> = {
      Genesis: "Creation and early human history",
      Exodus: "Israel's deliverance from Egypt",
      Matthew: "Life and ministry of Jesus Christ",
      John: "Theological presentation of Jesus as the Son of God",
      Romans: "Paul's systematic presentation of the gospel",
    };

    return contextMap[book] || "Biblical historical context";
  }

  private getPrimaryThemes(_passage: string): string[] {
    // This would identify primary theological themes
    return [
      "God's sovereignty",
      "Human sin and redemption",
      "Faith and obedience",
      "Love and grace",
    ];
  }

  private getSecondaryThemes(_passage: string): string[] {
    // This would identify secondary themes
    return [
      "Covenant relationship",
      "Divine justice",
      "Human responsibility",
      "Eternal life",
    ];
  }

  private getDoctrinalConnections(_passage: string): string[] {
    // This would identify connections to systematic theology
    return [
      "Doctrine of God",
      "Doctrine of Salvation",
      "Doctrine of the Church",
      "Doctrine of Last Things",
    ];
  }
}
