# OpenAI Adapter Environment Variable Configuration Example

This example demonstrates how to use the OGemini CLI with OpenAI-compatible APIs using environment variables.

## Setup

### 1. Using .env file (Recommended for Development)

Create a `.env` file in your project root:

```bash
# For OpenAI
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_BASE_URL=https://api.openai.com/v1

# For Moonshot AI (Kimi)
# OPENAI_API_KEY=sk-your-moonshot-key
# OPENAI_BASE_URL=https://api.moonshot.cn/v1

# For DeepSeek
# OPENAI_API_KEY=sk-your-deepseek-key
# OPENAI_BASE_URL=https://api.deepseek.com/v1

# Note: Model selection is done through the CLI using Gemini model names
# which are then mapped to the appropriate OpenAI-compatible model names
# via the openaiModelMapping configuration in settings.json
```

### 2. Using Shell Environment Variables

```bash
# For Linux/macOS
export OPENAI_API_KEY="sk-your-api-key"
export OPENAI_BASE_URL="https://api.openai.com/v1"

# For Windows (PowerShell)
$env:OPENAI_API_KEY = "sk-your-api-key"
$env:OPENAI_BASE_URL = "https://api.openai.com/v1"
```

### 3. Configure Authentication Type

Create or update `~/.gemini/settings.json`:

```json
{
  "selectedAuthType": "openai-api-key"
}
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

## Benefits of Environment Variable Configuration

1. **Security**: API keys are not stored in code or configuration files
2. **Flexibility**: Easy to switch between different providers
3. **CI/CD Friendly**: Works well with deployment pipelines
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