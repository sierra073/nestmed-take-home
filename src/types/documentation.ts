export interface DocumentationElement {
  id: string;
  question: string;
  answer?: string;
  context?: string;  // Additional context about when/how this element should be used
}