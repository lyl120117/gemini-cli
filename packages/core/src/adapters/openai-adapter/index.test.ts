/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenAIAdapter } from './index.js';
import { OpenAIConfig } from './types.js';

// Mock the OpenAI module
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation((config) => {
      return {
        apiKey: config.apiKey,
        baseURL: config.baseURL,
        chat: {
          completions: {
            create: vi.fn(),
          },
        },
        embeddings: {
          create: vi.fn(),
        },
      };
    }),
  };
});

describe('OpenAIAdapter', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should use provided apiKey and baseURL from config', () => {
      const config: OpenAIConfig = {
        apiKey: 'test-api-key',
        baseURL: 'https://custom.api.com/v1',
        model: 'gpt-4',
      };

      const adapter = new OpenAIAdapter(config);
      expect(adapter).toBeDefined();
    });

    it('should use environment variables when config values are not provided', () => {
      process.env.OPENAI_API_KEY = 'env-api-key';
      process.env.OPENAI_BASE_URL = 'https://env.api.com/v1';

      const config: OpenAIConfig = {
        model: 'gpt-4',
      };

      const adapter = new OpenAIAdapter(config);
      expect(adapter).toBeDefined();
    });

    it('should use default baseURL when neither config nor env var is provided', () => {
      process.env.OPENAI_API_KEY = 'env-api-key';
      delete process.env.OPENAI_BASE_URL;

      const config: OpenAIConfig = {
        model: 'gpt-4',
      };

      const adapter = new OpenAIAdapter(config);
      expect(adapter).toBeDefined();
    });

    it('should prefer config values over environment variables', () => {
      process.env.OPENAI_API_KEY = 'env-api-key';
      process.env.OPENAI_BASE_URL = 'https://env.api.com/v1';

      const config: OpenAIConfig = {
        apiKey: 'config-api-key',
        baseURL: 'https://config.api.com/v1',
        model: 'gpt-4',
      };

      const adapter = new OpenAIAdapter(config);
      expect(adapter).toBeDefined();
    });

    it('should throw error when no API key is provided', () => {
      delete process.env.OPENAI_API_KEY;

      const config: OpenAIConfig = {
        model: 'gpt-4',
      };

      expect(() => new OpenAIAdapter(config)).toThrow(
        'OpenAI API key is required. Please set OPENAI_API_KEY environment variable or provide it in the configuration.'
      );
    });
  });
});