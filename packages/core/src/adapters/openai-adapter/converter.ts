/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  GenerateContentParameters,
  GenerateContentResponse,
  GenerateContentResponseUsageMetadata,
  Content,
  Part,
  CountTokensParameters,
  CountTokensResponse,
  EmbedContentParameters,
  EmbedContentResponse,
  Candidate,
  FinishReason,
  SafetyRating,
  HarmCategory,
  HarmProbability,
} from '@google/genai';
import {
  OpenAIMessage,
  OpenAICompletionRequest,
  OpenAICompletionResponse,
  OpenAIStreamChunk,
  OpenAIEmbeddingRequest,
  OpenAIEmbeddingResponse,
  OpenAIMessageContent,
} from './types.js';

/**
 * Converts Gemini Content to OpenAI Message format
 */
export function contentToOpenAIMessage(content: Content): OpenAIMessage {
  const role = content.role === 'model' ? 'assistant' : content.role as 'user';
  
  if (!content.parts || content.parts.length === 0) {
    return { role, content: '' };
  }

  // Handle single text part
  if (content.parts.length === 1) {
    const part = content.parts[0];
    if (part && typeof part === 'object' && 'text' in part) {
      return { role, content: part.text || '' };
    }
  }

  // Handle multiple parts or non-text parts
  const openAIContent: OpenAIMessageContent[] = [];
  
  for (const part of content.parts) {
    if (part && typeof part === 'object') {
      if ('text' in part) {
        openAIContent.push({ type: 'text', text: part.text || '' });
      } else if ('inlineData' in part && part.inlineData) {
        // Convert inline data to image URL
        const mimeType = part.inlineData.mimeType || 'image/jpeg';
        const base64 = part.inlineData.data;
        openAIContent.push({
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${base64}`,
            detail: 'auto'
          }
        });
      } else if ('functionCall' in part && part.functionCall) {
        // Handle function calls
        return {
          role: 'assistant',
          content: '',
          function_call: {
            name: part.functionCall.name || 'unknown',
            arguments: JSON.stringify(part.functionCall.args || {})
          }
        };
      } else if ('functionResponse' in part && part.functionResponse) {
        // Handle function responses
        return {
          role: 'function',
          name: part.functionResponse.name || 'unknown',
          content: JSON.stringify(part.functionResponse.response)
        };
      }
    }
  }

  if (openAIContent.length > 0) {
    return { role, content: openAIContent };
  }

  return { role, content: '' };
}

/**
 * Converts Gemini GenerateContentParameters to OpenAI completion request
 */
export function toOpenAIRequest(
  params: GenerateContentParameters,
  model: string
): OpenAICompletionRequest {
  const messages: OpenAIMessage[] = [];

  // Add system message if present in config
  if (params.config?.systemInstruction) {
    let systemText = '';
    
    if (typeof params.config.systemInstruction === 'string') {
      systemText = params.config.systemInstruction;
    } else if (params.config.systemInstruction && 'parts' in params.config.systemInstruction) {
      const systemParts = params.config.systemInstruction.parts;
      systemText = systemParts
        ?.filter((part: any) => part && typeof part === 'object' && 'text' in part)
        .map((part: any) => part.text)
        .join('\n') || '';
    }
    
    if (systemText) {
      messages.push({ role: 'system', content: systemText });
    }
  }

  // Convert contents
  if (params.contents) {
    const contents = Array.isArray(params.contents) ? params.contents : [params.contents];
    for (const content of contents) {
      if (typeof content === 'string') {
        messages.push({ role: 'user', content });
      } else if (content && typeof content === 'object' && 'role' in content) {
        messages.push(contentToOpenAIMessage(content));
      }
    }
  }

  const request: OpenAICompletionRequest = {
    model,
    messages,
    temperature: params.config?.temperature,
    top_p: params.config?.topP,
    max_tokens: params.config?.maxOutputTokens,
    stream: false,
  };

  // Handle response format
  if (params.config?.responseMimeType === 'application/json') {
    request.response_format = { type: 'json_object' };
  }

  return request;
}

/**
 * Converts OpenAI response to Gemini GenerateContentResponse
 */
export function fromOpenAIResponse(
  openAIResponse: OpenAICompletionResponse | OpenAIStreamChunk
): GenerateContentResponse {
  const choice = openAIResponse.choices[0];
  if (!choice) {
    const response = new GenerateContentResponse();
    response.candidates = [];
    response.usageMetadata = createUsageMetadata(openAIResponse);
    return response;
  }

  const parts: Part[] = [];
  const message = 'delta' in choice ? choice.delta : choice.message;

  if (message?.tool_calls) {
    // Convert tool calls to function calls
    for (const toolCall of message.tool_calls) {
      if (toolCall.function) {
        parts.push({
          functionCall: {
            name: toolCall.function.name,
            args: JSON.parse(toolCall.function.arguments || '{}'),
          }
        });
      }
    }
  } else if (message?.function_call) {
    // Legacy function call format
    parts.push({
      functionCall: {
        name: message.function_call.name,
        args: JSON.parse(message.function_call.arguments || '{}'),
      }
    });
  } else if (message?.content) {
    // Regular text content
    if (typeof message.content === 'string') {
      parts.push({ text: message.content });
    } else {
      // Handle array of content
      for (const content of message.content) {
        if (content.type === 'text' && content.text) {
          parts.push({ text: content.text });
        }
      }
    }
  }

  const candidate: Candidate = {
    content: {
      role: 'model',
      parts,
    },
    finishReason: mapFinishReason(choice.finish_reason),
    index: choice.index,
    safetyRatings: createDefaultSafetyRatings(),
  };

  const response = new GenerateContentResponse();
  response.candidates = [candidate];
  response.usageMetadata = createUsageMetadata(openAIResponse);
  return response;
}

/**
 * Maps OpenAI finish reason to Gemini FinishReason
 */
function mapFinishReason(reason: string | null): FinishReason {
  switch (reason) {
    case 'stop':
      return FinishReason.STOP;
    case 'length':
      return FinishReason.MAX_TOKENS;
    case 'function_call':
    case 'tool_calls':
      return FinishReason.STOP;
    case 'content_filter':
      return FinishReason.SAFETY;
    case null:
    case undefined:
    case '':
      // Treat null/undefined/empty as normal completion
      return FinishReason.STOP;
    default:
      // Log unexpected finish reasons for debugging (disabled in production)
      // console.error(`[OpenAI Adapter] Unexpected finish_reason: ${reason}`);
      // For unrecognized reasons, treat as normal stop to avoid warning messages
      return FinishReason.STOP;
  }
}

/**
 * Creates usage metadata from OpenAI response
 */
function createUsageMetadata(
  response: OpenAICompletionResponse | OpenAIStreamChunk
): GenerateContentResponseUsageMetadata | undefined {
  if ('usage' in response && response.usage) {
    const metadata = new GenerateContentResponseUsageMetadata();
    metadata.promptTokenCount = response.usage.prompt_tokens;
    metadata.candidatesTokenCount = response.usage.completion_tokens;
    // totalTokenCount is computed property in GenerateContentResponseUsageMetadata
    return metadata;
  }
  return undefined;
}

/**
 * Creates default safety ratings (OpenAI doesn't provide these)
 */
function createDefaultSafetyRatings(): SafetyRating[] {
  const categories: HarmCategory[] = [
    HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    HarmCategory.HARM_CATEGORY_HARASSMENT,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
  ];

  return categories.map(category => ({
    category,
    probability: HarmProbability.NEGLIGIBLE,
  }));
}

/**
 * Converts CountTokensParameters for OpenAI
 */
export function toOpenAITokenCountRequest(
  params: CountTokensParameters,
  model: string
): OpenAICompletionRequest {
  // OpenAI doesn't have a direct token count API, so we convert to a completion request
  // and use max_tokens=1 to minimize cost
  const genParams: GenerateContentParameters = {
    model: params.model,
    contents: params.contents,
    config: params.config,
  };
  
  const request = toOpenAIRequest(genParams, model);
  request.max_tokens = 1;
  return request;
}

/**
 * Creates a CountTokensResponse from OpenAI response
 */
export function createTokenCountResponse(
  promptTokens: number
): CountTokensResponse {
  return {
    totalTokens: promptTokens,
  };
}

/**
 * Converts EmbedContentParameters to OpenAI embedding request
 */
export function toOpenAIEmbeddingRequest(
  params: EmbedContentParameters,
  model: string
): OpenAIEmbeddingRequest {
  const contents = params.contents;
  let input: string | string[];

  if (typeof contents === 'string') {
    input = contents;
  } else if (Array.isArray(contents)) {
    // Handle array of contents
    const texts: string[] = [];
    for (const content of contents) {
      if (typeof content === 'string') {
        texts.push(content);
      } else if (content && typeof content === 'object' && 'parts' in content && content.parts) {
        const contentTexts = content.parts
          .filter((part: any) => part && typeof part === 'object' && 'text' in part)
          .map((part: any) => part.text || '')
          .filter((text: string) => text.length > 0);
        texts.push(...contentTexts);
      }
    }
    input = texts.length === 1 ? texts[0] : texts;
  } else if (contents && typeof contents === 'object' && 'parts' in contents && contents.parts) {
    // Single content object
    const texts = contents.parts
      .filter((part: any) => part && typeof part === 'object' && 'text' in part)
      .map((part: any) => part.text || '')
      .filter((text: string) => text.length > 0);
    
    input = texts.length === 1 ? texts[0] : texts;
  } else {
    input = '';
  }

  return {
    model,
    input,
  };
}

/**
 * Converts OpenAI embedding response to Gemini format
 */
export function fromOpenAIEmbeddingResponse(
  response: OpenAIEmbeddingResponse
): EmbedContentResponse {
  const embedResponse = new EmbedContentResponse();
  
  if (response.data && response.data.length > 0) {
    embedResponse.embeddings = response.data.map(item => ({
      values: item.embedding,
    }));
  }
  
  return embedResponse;
}