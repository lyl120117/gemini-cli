# Migration Guide: From Environment Variables to Settings Configuration

This guide helps you migrate from using only environment variables to the new settings.json configuration for OpenAI adapter.

## What's New

Starting from version 0.1.13, OGemini CLI supports configuring OpenAI API credentials directly in the settings.json file, in addition to environment variables. This provides:

- Better security by keeping API keys in a single configuration file
- Easier management of multiple provider configurations
- Consistent configuration across different environments

## Migration Steps

### 1. Locate Your Current Configuration

If you're currently using environment variables, you likely have:

**.env file:**
```bash
OPENAI_API_KEY=sk-your-api-key
OPENAI_BASE_URL=https://api.provider.com/v1
```

**Or shell environment:**
```bash
export OPENAI_API_KEY="sk-your-api-key"
export OPENAI_BASE_URL="https://api.provider.com/v1"
```

### 2. Create or Update settings.json

Create or update `~/.gemini/settings.json`:

```json
{
  "selectedAuthType": "openai-api-key",
  "openaiApiKey": "sk-your-api-key",
  "openaiBaseUrl": "https://api.provider.com/v1",
  "openaiModelMapping": {
    "gemini-2.5-pro": "your-model-name",
    "gemini-2.5-flash": "your-fast-model-name"
  }
}
```

### 3. Test Your Configuration

Run OGemini CLI to verify the configuration works:

```bash
ogemini
```

### 4. (Optional) Remove Environment Variables

Once you've confirmed the settings.json configuration works, you can optionally remove the environment variables:

- Delete or comment out lines in `.env` file
- Remove `export` statements from your shell profile

## Configuration Priority

The system uses the following priority order:
1. **settings.json** (highest priority)
2. Environment variables
3. Default values (for base URL only)

This means you can:
- Use settings.json for your default configuration
- Override temporarily with environment variables when needed

## Examples

### Before (Environment Variables Only)

**.env file:**
```bash
OPENAI_API_KEY=sk-moonshot-key
OPENAI_BASE_URL=https://api.moonshot.cn/v1
```

**settings.json:**
```json
{
  "selectedAuthType": "openai-api-key",
  "openaiModelMapping": {
    "gemini-2.5-pro": "kimi-k2-0711-preview",
    "gemini-2.5-flash": "kimi-k1-0701"
  }
}
```

### After (Full Settings Configuration)

**settings.json:**
```json
{
  "selectedAuthType": "openai-api-key",
  "openaiApiKey": "sk-moonshot-key",
  "openaiBaseUrl": "https://api.moonshot.cn/v1",
  "openaiModelMapping": {
    "gemini-2.5-pro": "kimi-k2-0711-preview",
    "gemini-2.5-flash": "kimi-k1-0701"
  }
}
```

## Benefits of the New Approach

1. **Single Source of Truth**: All OpenAI-related configuration in one place
2. **Better Security**: No need to expose API keys in environment variables
3. **Easier Switching**: Quickly switch between providers by updating one file
4. **Version Control Friendly**: Can track configuration changes (exclude API keys)

## Backward Compatibility

The old environment variable approach still works. If you don't add `openaiApiKey` or `openaiBaseUrl` to settings.json, the system will automatically fall back to reading from environment variables.

## Troubleshooting

### Configuration Not Working

1. Check file permissions on `~/.gemini/settings.json`
2. Ensure JSON syntax is valid (no trailing commas, proper quotes)
3. Verify the file path is correct: `~/.gemini/settings.json`

### Still Reading from Environment

This is expected if:
- `openaiApiKey` or `openaiBaseUrl` are not set in settings.json
- Environment variables will be used as fallback

### Need to Override Temporarily

You can still use environment variables to override settings.json values since settings take priority:

```bash
# This will NOT override settings.json
export OPENAI_API_KEY="different-key"

# To override, temporarily rename or modify settings.json
```