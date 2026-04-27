export interface AIProvider {
  /**
   * Sends a prompt to the AI provider and returns the text response.
   * Throws an error if the request fails or the API key is invalid.
   */
  analyze(prompt: string): Promise<string>;

  /**
   * Validates that the API key is syntactically non-empty.
   * Does not make a network call — for a real validation test call analyze().
   */
  validateApiKey(apiKey: string): boolean;
}
