/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import {
  createContentGenerator,
  AuthType,
  createContentGeneratorConfig,
} from './contentGenerator.js';
import { createCodeAssistContentGenerator } from '../code_assist/codeAssist.js';
import { GoogleGenAI } from '@google/genai';
import { Config } from '../config/config.js';

vi.mock('../code_assist/codeAssist.js');
vi.mock('@google/genai');

const mockConfig = {} as unknown as Config;

describe('createContentGenerator', () => {
  it('should create a CodeAssistContentGenerator', async () => {
    const mockGenerator = {} as unknown;
    vi.mocked(createCodeAssistContentGenerator).mockResolvedValue(
      mockGenerator as never,
    );
    const generator = await createContentGenerator(
      {
        model: 'test-model',
        authType: AuthType.LOGIN_WITH_GOOGLE,
      },
      mockConfig,
    );
    expect(createCodeAssistContentGenerator).toHaveBeenCalled();
    expect(generator).toBe(mockGenerator);
  });

  it('should create a GoogleGenAI content generator', async () => {
    const mockGenerator = {
      models: {},
    } as unknown;
    vi.mocked(GoogleGenAI).mockImplementation(() => mockGenerator as never);
    const generator = await createContentGenerator(
      {
        model: 'test-model',
        apiKey: 'test-api-key',
        authType: AuthType.USE_GEMINI,
      },
      mockConfig,
    );
    expect(GoogleGenAI).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
      vertexai: undefined,
      httpOptions: {
        headers: {
          'User-Agent': expect.any(String),
        },
      },
    });
    expect(generator).toBe((mockGenerator as GoogleGenAI).models);
  });
});

describe('createContentGeneratorConfig', () => {
  const originalEnv = process.env;
  const mockConfig = {
    getModel: vi.fn().mockReturnValue('gemini-pro'),
    setModel: vi.fn(),
    flashFallbackHandler: vi.fn(),
    getProxy: vi.fn(),
    getOpenAIApiKey: vi.fn(),
    getOpenAIBaseUrl: vi.fn(),
    getOpenAIModelMapping: vi.fn().mockReturnValue({}),
  } as unknown as Config;

  beforeEach(() => {
    // Reset modules to re-evaluate imports and environment variables
    vi.resetModules();
    // Restore process.env before each test
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterAll(() => {
    // Restore original process.env after all tests
    process.env = originalEnv;
  });

  it('should configure for Gemini using GEMINI_API_KEY when set', async () => {
    process.env.GEMINI_API_KEY = 'env-gemini-key';
    const config = await createContentGeneratorConfig(
      mockConfig,
      AuthType.USE_GEMINI,
    );
    expect(config.apiKey).toBe('env-gemini-key');
    expect(config.vertexai).toBe(false);
  });

  it('should not configure for Gemini if GEMINI_API_KEY is empty', async () => {
    process.env.GEMINI_API_KEY = '';
    const config = await createContentGeneratorConfig(
      mockConfig,
      AuthType.USE_GEMINI,
    );
    expect(config.apiKey).toBeUndefined();
    expect(config.vertexai).toBeUndefined();
  });

  it('should configure for Vertex AI using GOOGLE_API_KEY when set', async () => {
    process.env.GOOGLE_API_KEY = 'env-google-key';
    const config = await createContentGeneratorConfig(
      mockConfig,
      AuthType.USE_VERTEX_AI,
    );
    expect(config.apiKey).toBe('env-google-key');
    expect(config.vertexai).toBe(true);
  });

  it('should configure for Vertex AI using GCP project and location when set', async () => {
    process.env.GOOGLE_CLOUD_PROJECT = 'env-gcp-project';
    process.env.GOOGLE_CLOUD_LOCATION = 'env-gcp-location';
    const config = await createContentGeneratorConfig(
      mockConfig,
      AuthType.USE_VERTEX_AI,
    );
    expect(config.vertexai).toBe(true);
    expect(config.apiKey).toBeUndefined();
  });

  it('should not configure for Vertex AI if required env vars are empty', async () => {
    process.env.GOOGLE_API_KEY = '';
    process.env.GOOGLE_CLOUD_PROJECT = '';
    process.env.GOOGLE_CLOUD_LOCATION = '';
    const config = await createContentGeneratorConfig(
      mockConfig,
      AuthType.USE_VERTEX_AI,
    );
    expect(config.apiKey).toBeUndefined();
    expect(config.vertexai).toBeUndefined();
  });

  it('should configure for OpenAI using settings first', async () => {
    // Mock settings values
    mockConfig.getOpenAIApiKey = vi.fn().mockReturnValue('settings-api-key');
    mockConfig.getOpenAIBaseUrl = vi.fn().mockReturnValue('https://settings.api.com/v1');
    mockConfig.getOpenAIModelMapping = vi.fn().mockReturnValue({
      'gemini-pro': 'custom-model',
    });
    
    // Also set environment variables to test priority
    process.env.OPENAI_API_KEY = 'env-api-key';
    process.env.OPENAI_BASE_URL = 'https://env.api.com/v1';

    const config = await createContentGeneratorConfig(
      mockConfig,
      AuthType.USE_OPENAI,
    );
    
    expect(config.apiKey).toBe('settings-api-key');
    expect((config as any).openaiBaseUrl).toBe('https://settings.api.com/v1');
    expect((config as any).openaiModelMapping).toEqual({
      'gemini-pro': 'custom-model',
    });
    expect(config.vertexai).toBe(false);
  });

  it('should configure for OpenAI using environment variables as fallback', async () => {
    // Mock no settings values
    mockConfig.getOpenAIApiKey = vi.fn().mockReturnValue(undefined);
    mockConfig.getOpenAIBaseUrl = vi.fn().mockReturnValue(undefined);
    
    // Set environment variables
    process.env.OPENAI_API_KEY = 'env-api-key';
    process.env.OPENAI_BASE_URL = 'https://env.api.com/v1';

    const config = await createContentGeneratorConfig(
      mockConfig,
      AuthType.USE_OPENAI,
    );
    
    expect(config.apiKey).toBe('env-api-key');
    expect((config as any).openaiBaseUrl).toBe('https://env.api.com/v1');
    expect(config.vertexai).toBe(false);
  });

  it('should handle partial OpenAI configuration from settings and env', async () => {
    // API key from settings, base URL from environment
    mockConfig.getOpenAIApiKey = vi.fn().mockReturnValue('settings-api-key');
    mockConfig.getOpenAIBaseUrl = vi.fn().mockReturnValue(undefined);
    process.env.OPENAI_BASE_URL = 'https://env.api.com/v1';

    const config = await createContentGeneratorConfig(
      mockConfig,
      AuthType.USE_OPENAI,
    );
    
    expect(config.apiKey).toBe('settings-api-key');
    expect((config as any).openaiBaseUrl).toBe('https://env.api.com/v1');
  });
});
