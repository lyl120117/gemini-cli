/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Maps Gemini model names to OpenAI model names
 */
export function mapGeminiModelToOpenAI(
  geminiModel: string, 
  customMapping?: Record<string, string>
): string {
  // Default model mappings
  const defaultModelMap: Record<string, string> = {
    // Gemini Pro models
    'gemini-2.5-pro': 'gpt-4o',
    'gemini-2.0-pro': 'gpt-4o',
    'gemini-1.5-pro': 'gpt-4o',
    'gemini-1.0-pro': 'gpt-4',
    'gemini-pro': 'gpt-4',
    
    // Gemini Flash models
    'gemini-2.5-flash': 'gpt-4o-mini',
    'gemini-2.0-flash': 'gpt-4o-mini',
    'gemini-1.5-flash': 'gpt-4o-mini',
    'gemini-flash': 'gpt-4o-mini',
    
    // Default fallback
    'models/gemini-2.5-pro': 'gpt-4o',
    'models/gemini-2.5-flash': 'gpt-4o-mini',
  };

  // Merge custom mappings with defaults (custom mappings take precedence)
  const modelMap = customMapping 
    ? { ...defaultModelMap, ...customMapping }
    : defaultModelMap;

  // Check for exact match
  if (modelMap[geminiModel]) {
    return modelMap[geminiModel];
  }

  // Check if it starts with 'models/' and try without prefix
  if (geminiModel.startsWith('models/')) {
    const withoutPrefix = geminiModel.substring(7);
    if (modelMap[withoutPrefix]) {
      return modelMap[withoutPrefix];
    }
  }

  // If OpenAI model is already specified, use it directly
  if (geminiModel.startsWith('gpt-') || geminiModel.startsWith('o1-') || geminiModel.includes('embedding')) {
    return geminiModel;
  }

  // If it's a custom model (contains hyphens and doesn't start with gemini), use it directly
  // This handles custom models like kimi-k2-0711-preview, claude-3, etc.
  if (geminiModel.includes('-') && !geminiModel.startsWith('gemini')) {
    return geminiModel;
  }

  // Default to gpt-4o-mini for unknown models
  return 'gpt-4o-mini';
}

/**
 * Maps OpenAI finish reasons to more user-friendly messages
 */
export function mapOpenAIFinishReason(reason: string | null): string {
  switch (reason) {
    case 'stop':
      return 'completed';
    case 'length':
      return 'max_tokens_reached';
    case 'function_call':
    case 'tool_calls':
      return 'tool_use';
    case 'content_filter':
      return 'content_filtered';
    default:
      return reason || 'unknown';
  }
}