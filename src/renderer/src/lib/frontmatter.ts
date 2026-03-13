/**
 * Extract YAML frontmatter from markdown content.
 * Returns the frontmatter block (including delimiters) and the body without frontmatter.
 */
export function extractFrontmatter(content: string): { frontmatter: string; body: string } {
  const match = content.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n?)/)
  if (!match) {
    return { frontmatter: '', body: content }
  }
  const frontmatter = match[1]
  const body = content.slice(frontmatter.length)
  return { frontmatter, body }
}

/**
 * Re-prepend frontmatter to markdown body.
 */
export function prependFrontmatter(frontmatter: string, body: string): string {
  if (!frontmatter) return body
  // Ensure frontmatter ends with newline
  const fm = frontmatter.endsWith('\n') ? frontmatter : frontmatter + '\n'
  return fm + body
}
