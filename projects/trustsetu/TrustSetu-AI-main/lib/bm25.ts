const tokenize = (s: string): string[] =>
  s.toLowerCase().match(/[a-z0-9]+/g) ?? []

export class BM25Index {
  private readonly docs: string[][]
  private readonly docFreq = new Map<string, number>()
  private readonly idf = new Map<string, number>()
  private readonly avgdl: number
  private readonly N: number
  private readonly k1 = 1.5
  private readonly b = 0.75

  constructor(rawDocs: string[]) {
    this.docs = rawDocs.map((d) => tokenize(d))
    this.N = this.docs.length
    let totalLen = 0
    for (const tokens of this.docs) {
      totalLen += tokens.length
      const seen = new Set<string>()
      for (const t of tokens) {
        if (!seen.has(t)) {
          seen.add(t)
          this.docFreq.set(t, (this.docFreq.get(t) ?? 0) + 1)
        }
      }
    }
    this.avgdl = this.N ? totalLen / this.N : 0
    for (const [term, df] of this.docFreq) {
      const idf = Math.log(1 + (this.N - df + 0.5) / (df + 0.5))
      this.idf.set(term, idf)
    }
  }

  scoreDoc(query: string, docIndex: number): number {
    const q = tokenize(query)
    const doc = this.docs[docIndex]
    if (!doc.length) return 0
    const tf = new Map<string, number>()
    for (const t of doc) tf.set(t, (tf.get(t) ?? 0) + 1)
    const dl = doc.length
    let s = 0
    for (const term of q) {
      const f = tf.get(term) ?? 0
      if (!f) continue
      const idf = this.idf.get(term) ?? 0
      const num = f * (this.k1 + 1)
      const den = f + this.k1 * (1 - this.b + (this.b * dl) / (this.avgdl || 1))
      s += idf * (num / den)
    }
    return s
  }

  search(query: string, topK: number): { index: number; score: number }[] {
    const scores: { index: number; score: number }[] = []
    for (let i = 0; i < this.N; i++) {
      const score = this.scoreDoc(query, i)
      if (score > 0) scores.push({ index: i, score })
    }
    scores.sort((a, b) => b.score - a.score)
    return scores.slice(0, topK)
  }
}
