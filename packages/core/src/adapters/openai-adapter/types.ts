/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Type } from '@google/genai';

/**
 * OpenAI specific types and interfaces
 */

export interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
  model: string;
  modelMapping?: Record<string, string>;
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string | OpenAIMessageContent[];
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

export interface OpenAIMessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

export interface OpenAIFunction {
  name: string;
  description?: string;
  parameters: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
}

export interface OpenAITool {
  type: 'function';
  function: OpenAIFunction;
}

export interface OpenAIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface OpenAIChoice {
  index: number;
  message: OpenAIMessage & {
    tool_calls?: OpenAIToolCall[];
  };
  finish_reason: string | null;
  delta?: Partial<OpenAIMessage & {
    tool_calls?: OpenAIToolCall[];
  }>;
}

export interface OpenAICompletionRequest {
  model: string;
  messages: OpenAIMessage[];
  tools?: OpenAITool[];
  tool_choice?: 'none' | 'auto' | { type: 'function'; function: { name: string } };
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  response_format?: { type: 'text' | 'json_object' };
}

export interface OpenAICompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
}

export interface OpenAIEmbeddingRequest {
  model: string;
  input: string | string[];
  encoding_format?: 'float' | 'base64';
}

export interface OpenAIEmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    index: number;
    embedding: number[];
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * Maps Gemini Type enum to OpenAI type strings
 */
export const typeMapping: Record<Type, string> = {
  [Type.TYPE_UNSPECIFIED]: 'object',
  [Type.STRING]: 'string',
  [Type.NUMBER]: 'number',
  [Type.INTEGER]: 'integer',
  [Type.BOOLEAN]: 'boolean',
  [Type.ARRAY]: 'array',
  [Type.OBJECT]: 'object',
  [Type.NULL]: 'null',
};