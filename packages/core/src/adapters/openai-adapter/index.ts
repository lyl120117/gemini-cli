/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import OpenAI from 'openai';
import {
  GenerateContentParameters,
  GenerateContentResponse,
  CountTokensParameters,
  CountTokensResponse,
  EmbedContentParameters,
  EmbedContentResponse,
} from '@google/genai';
import { ContentGenerator } from '../../core/contentGenerator.js';
import { OpenAIConfig } from './types.js';
import {
  toOpenAIRequest,
  fromOpenAIResponse,
  toOpenAITokenCountRequest,
  createTokenCountResponse,
  toOpenAIEmbeddingRequest,
  fromOpenAIEmbeddingResponse,
} from './converter.js';
import { toolsToOpenAITools } from './tool-converter.js';
import { mapGeminiModelToOpenAI } from './model-mapper.js';

/**
 * OpenAI adapter that implements the ContentGenerator interface
 */
export class OpenAIAdapter implements ContentGenerator {
  private client: OpenAI;
  private model: string;
  private embeddingModel: string;
  private modelMapping: Record<string, string> | undefined;

  constructor(config: OpenAIConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
    this.modelMapping = config.modelMapping;
    // Map Gemini model names to OpenAI equivalents
    this.model = mapGeminiModelToOpenAI(config.model, this.modelMapping);
    // Map embedding models
    this.embeddingModel = this.getEmbeddingModel(this.model);
  }

  /**
   * Generate content using OpenAI API
   */
  async generateContent(
    request: GenerateContentParameters
  ): Promise<GenerateContentResponse> {
    const openAIRequest = toOpenAIRequest(request, this.model);
    
    // Add tools if present
    const tools = (request as any).tools ? toolsToOpenAITools((request as any).tools) : undefined;

    try {
      const chatRequest: OpenAI.Chat.ChatCompletionCreateParams = {
        model: openAIRequest.model,
        messages: openAIRequest.messages as OpenAI.Chat.ChatCompletionMessageParam[],
        temperature: openAIRequest.temperature,
        top_p: openAIRequest.top_p,
        max_tokens: openAIRequest.max_tokens,
        tools: tools as OpenAI.Chat.ChatCompletionTool[] | undefined,
        tool_choice: tools ? 'auto' : undefined,
        response_format: openAIRequest.response_format,
      };

      const response = await this.client.chat.completions.create(chatRequest);
      return fromOpenAIResponse(response as any);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate content stream using OpenAI API
   */
  async generateContentStream(
    request: GenerateContentParameters
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    const openAIRequest = toOpenAIRequest(request, this.model);
    
    // Add tools if present
    const tools = (request as any).tools ? toolsToOpenAITools((request as any).tools) : undefined;

    try {
      const chatRequest: OpenAI.Chat.ChatCompletionCreateParams = {
        model: openAIRequest.model,
        messages: openAIRequest.messages as OpenAI.Chat.ChatCompletionMessageParam[],
        temperature: openAIRequest.temperature,
        top_p: openAIRequest.top_p,
        max_tokens: openAIRequest.max_tokens,
        tools: tools as OpenAI.Chat.ChatCompletionTool[] | undefined,
        tool_choice: tools ? 'auto' : undefined,
        response_format: openAIRequest.response_format,
        stream: true,
      };

      const stream = await this.client.chat.completions.create(chatRequest);
      return this.streamToGenerator(stream as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Count tokens using OpenAI API
   */
  async countTokens(
    request: CountTokensParameters
  ): Promise<CountTokensResponse> {
    // OpenAI doesn't have a direct token counting API
    // We'll use tiktoken library for client-side counting
    // For now, we'll make a dummy request with max_tokens=1
    const openAIRequest = toOpenAITokenCountRequest(request, this.model);
    
    try {
      // Create a completion with max_tokens=1 to get token count
      const chatRequest: OpenAI.Chat.ChatCompletionCreateParams = {
        model: openAIRequest.model,
        messages: openAIRequest.messages as OpenAI.Chat.ChatCompletionMessageParam[],
        max_tokens: 1,
        stream: false,
      };

      const response = await this.client.chat.completions.create(chatRequest);
      
      const promptTokens = response.usage?.prompt_tokens || 0;
      return createTokenCountResponse(promptTokens);
    } catch (error) {
      // If the request fails, estimate tokens
      const text = JSON.stringify(request);
      const estimatedTokens = Math.ceil(text.length / 4); // Rough estimate
      return createTokenCountResponse(estimatedTokens);
    }
  }

  /**
   * Embed content using OpenAI API
   */
  async embedContent(
    request: EmbedContentParameters
  ): Promise<EmbedContentResponse> {
    const openAIRequest = toOpenAIEmbeddingRequest(request, this.embeddingModel);
    
    try {
      const response = await this.client.embeddings.create({
        model: openAIRequest.model,
        input: openAIRequest.input,
      });
      return fromOpenAIEmbeddingResponse(response as any);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Convert OpenAI stream to async generator
   */
  private async *streamToGenerator(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
  ): AsyncGenerator<GenerateContentResponse> {
    for await (const chunk of stream) {
      // Convert OpenAI chunk to Gemini response
      const response = fromOpenAIResponse(chunk as any);
      yield response;
    }
  }

  /**
   * Handle OpenAI errors and convert to appropriate format
   */
  private handleError(error: unknown): Error {
    if (error instanceof OpenAI.APIError) {
      const message = `OpenAI API Error: ${error.message}`;
      const newError = new Error(message);
      (newError as any).status = error.status;
      (newError as any).code = error.code;
      return newError;
    }
    
    if (error instanceof Error) {
      return error;
    }
    
    return new Error(`Unknown error: ${String(error)}`);
  }

  /**
   * Get appropriate embedding model based on chat model
   */
  private getEmbeddingModel(chatModel: string): string {
    // Map chat models to embedding models
    if (chatModel.includes('gpt-4') || chatModel.includes('gpt-3.5')) {
      return 'text-embedding-3-small';
    }
    // Default embedding model
    return 'text-embedding-ada-002';
  }
}

/**
 * Create an OpenAI adapter instance
 */
export function createOpenAIAdapter(config: OpenAIConfig): ContentGenerator {
  return new OpenAIAdapter(config);
}