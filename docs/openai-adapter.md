# OpenAI Adapter Configuration

The Gemini CLI includes an OpenAI adapter that allows you to use OpenAI-compatible APIs, including OpenAI itself and alternative providers like Moonshot AI (Kimi), DeepSeek, and others.

## Overview

The OpenAI adapter translates between Gemini's API format and OpenAI's API format, enabling seamless use of any OpenAI-compatible service with the Gemini CLI.

## Configuration Methods

### 1. Environment Variables

Create a `.env` file in your project root or home directory:

```bash
# Required
OPENAI_API_KEY=your-api-key-here

# Optional (defaults to OpenAI's API)
OPENAI_BASE_URL=https://api.openai.com/v1

# Optional (defaults to gpt-4-turbo-preview)
OPENAI_MODEL=gpt-4
```

### 2. Settings Configuration

Configure authentication and model mappings in `settings.json`:

**User settings:** `~/.gemini/settings.json`  
**Project settings:** `.gemini/settings.json`

```json
{
  "selectedAuthType": "openai-api-key",
  "openaiModelMapping": {
    "gemini-2.5-pro": "gpt-4o",
    "gemini-2.5-flash": "gpt-4o-mini",
    "gemini-2.0-pro": "gpt-4",
    "gemini-1.5-pro": "gpt-4-turbo",
    "gemini-1.5-flash": "gpt-3.5-turbo"
  }
}
```

## Model Mapping

The `openaiModelMapping` configuration allows custom mapping of Gemini model names to OpenAI-compatible model names.

### Default Mappings

| Gemini Model | OpenAI Model |
|-------------|--------------|
| gemini-2.5-pro | gpt-4o |
| gemini-2.0-pro | gpt-4o |
| gemini-1.5-pro | gpt-4o |
| gemini-1.0-pro | gpt-4 |
| gemini-pro | gpt-4 |
| gemini-2.5-flash | gpt-4o-mini |
| gemini-2.0-flash | gpt-4o-mini |
| gemini-1.5-flash | gpt-4o-mini |
| gemini-flash | gpt-4o-mini |

### Custom Provider Examples

**Moonshot AI (Kimi):**
```json
{
  "selectedAuthType": "openai-api-key",
  "openaiModelMapping": {
    "gemini-2.5-pro": "kimi-k2-0711-preview",
    "gemini-2.5-flash": "kimi-k1-0701"
  }
}
```

**DeepSeek:**
```json
{
  "selectedAuthType": "openai-api-key",
  "openaiModelMapping": {
    "gemini-2.5-pro": "deepseek-chat",
    "gemini-2.5-flash": "deepseek-coder"
  }
}
```

## Usage

1. Configure your environment variables and/or settings
2. Start the CLI:
   ```bash
   gemini
   ```
3. Select "Use OpenAI API Key" when prompted for authentication
4. The CLI will use your configured OpenAI-compatible API

### Non-interactive mode:
```bash
gemini -p "Your prompt here"
```

## Supported Features

- ✅ **Text generation**: Full support for chat completions
- ✅ **Streaming**: Real-time response streaming
- ✅ **Tool/Function calling**: Automatic conversion between formats
- ✅ **System prompts**: Converted to OpenAI system messages
- ✅ **Multi-turn conversations**: Full conversation history
- ✅ **Token counting**: Estimated for OpenAI models
- ✅ **Embeddings**: If supported by provider
- ✅ **Image inputs**: Base64 encoded images
- ✅ **JSON mode**: Response format configuration

## Alternative Providers

### Moonshot AI (Kimi)
```bash
OPENAI_API_KEY=sk-your-moonshot-key
OPENAI_BASE_URL=https://api.moonshot.cn/v1
OPENAI_MODEL=kimi-k2-0711-preview
```
- Supports very long context (up to 1M tokens)
- Models: `kimi-k2-0711-preview`, `kimi-k1-0701`

### DeepSeek
```bash
OPENAI_API_KEY=sk-your-deepseek-key
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
```
- Optimized for code generation
- Models: `deepseek-chat`, `deepseek-coder`

### Local LLMs
```bash
OPENAI_BASE_URL=http://localhost:8080/v1
OPENAI_API_KEY=not-needed
OPENAI_MODEL=local-model-name
```

## Limitations

- OpenAI doesn't provide safety ratings like Gemini (set to defaults)
- Token counting is estimated (no direct API)
- Some Gemini-specific features may not have equivalents
- Provider-specific features may vary

## Troubleshooting

### Common Issues

1. **Authentication errors**: Verify API key and base URL
2. **Model not found**: Check model name matches provider's documentation
3. **"Response stopped for other reasons"**: Usually harmless, indicates unrecognized finish reason

### Debug Mode

Enable detailed logging:
```bash
gemini -d
```

## Security

- Never commit `.env` files to version control
- Use environment-specific API keys
- Regularly rotate API keys
- Consider network security when using local endpoints