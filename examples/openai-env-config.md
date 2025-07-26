# OpenAI Adapter Configuration Example

This example demonstrates how to use the OGemini CLI with OpenAI-compatible APIs.

## Setup

### 1. Using settings.json (Recommended)

Create or update `~/.gemini/settings.json`:

```json
{
  "selectedAuthType": "openai-api-key",
  "openaiApiKey": "sk-your-api-key",
  "openaiBaseUrl": "https://api.openai.com/v1",
  "openaiModelMapping": {
    "gemini-2.5-pro": "gpt-4o",
    "gemini-2.5-flash": "gpt-4o-mini"
  }
}
```

For other providers, adjust the configuration:

**Moonshot AI (Kimi):**
```json
{
  "selectedAuthType": "openai-api-key",
  "openaiApiKey": "sk-your-moonshot-key",
  "openaiBaseUrl": "https://api.moonshot.cn/v1",
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
  "openaiApiKey": "sk-your-deepseek-key",
  "openaiBaseUrl": "https://api.deepseek.com/v1",
  "openaiModelMapping": {
    "gemini-2.5-pro": "deepseek-chat",
    "gemini-2.5-flash": "deepseek-coder"
  }
}
```

### 2. Using Environment Variables (Fallback)

If you prefer environment variables or need to override settings:

```bash
# For Linux/macOS
export OPENAI_API_KEY="sk-your-api-key"
export OPENAI_BASE_URL="https://api.openai.com/v1"

# For Windows (PowerShell)
$env:OPENAI_API_KEY = "sk-your-api-key"
$env:OPENAI_BASE_URL = "https://api.openai.com/v1"
```

Or create a `.env` file in your project root:

```bash
OPENAI_API_KEY=sk-your-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
```

## Model Selection

When using the OpenAI adapter, you select models using standard Gemini model names (e.g., `gemini-2.5-flash`, `gemini-2.5-pro`). These are automatically mapped to the appropriate OpenAI-compatible model names based on your `openaiModelMapping` configuration.

For example:
- Select "gemini-2.5-flash" → Maps to "kimi-k1-0701" (if using Moonshot AI)
- Select "gemini-2.5-pro" → Maps to "kimi-k2-0711-preview" (if using Moonshot AI)

## Usage

Once configured, simply run:

```bash
ogemini
```

The CLI will automatically:
1. Detect the `openai-api-key` auth type from settings
2. Read API credentials from environment variables
3. Use the specified base URL (or default to OpenAI's API)
4. Connect to the OpenAI-compatible service
5. Map your selected Gemini model to the appropriate provider model

## Configuration Priority

The OGemini CLI uses the following priority order for OpenAI configuration:
1. Settings from `settings.json` (highest priority)
2. Environment variables
3. Default values (for base URL only)

## Benefits

1. **Security**: API keys can be stored securely in settings or environment
2. **Flexibility**: Easy to switch between different providers
3. **CI/CD Friendly**: Environment variables work well with deployment pipelines
4. **Multiple Environments**: Different keys for dev/staging/production

## Troubleshooting

If you encounter authentication errors:

1. Verify environment variables are set:
   ```bash
   echo $OPENAI_API_KEY
   echo $OPENAI_BASE_URL
   ```

2. Ensure the auth type is correctly set in settings.json

3. Check that your API key has the necessary permissions

4. For custom providers, verify the base URL is correct and includes `/v1`