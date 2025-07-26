/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tool, FunctionDeclaration, Schema, Type } from '@google/genai';
import { OpenAITool, OpenAIFunction, typeMapping } from './types.js';

/**
 * Converts Gemini Tool to OpenAI Tool format
 */
export function toolToOpenAITool(tool: Tool): OpenAITool {
  const functionDeclaration = tool.functionDeclarations?.[0];
  if (!functionDeclaration) {
    throw new Error('Tool must have at least one function declaration');
  }

  return {
    type: 'function',
    function: functionDeclarationToOpenAIFunction(functionDeclaration),
  };
}

/**
 * Converts Gemini FunctionDeclaration to OpenAI Function format
 */
export function functionDeclarationToOpenAIFunction(
  funcDecl: FunctionDeclaration
): OpenAIFunction {
  if (!funcDecl.name) {
    throw new Error('Function declaration must have a name');
  }

  const openAIFunction: OpenAIFunction = {
    name: funcDecl.name,
    parameters: schemaToOpenAISchema(funcDecl.parameters),
  };

  if (funcDecl.description) {
    openAIFunction.description = funcDecl.description;
  }

  return openAIFunction;
}

/**
 * Converts Gemini Schema to OpenAI JSON Schema format
 */
export function schemaToOpenAISchema(schema?: Schema): any {
  if (!schema) {
    return { type: 'object', properties: {} };
  }

  const result: any = {};

  // Map type
  if (schema.type) {
    result.type = typeMapping[schema.type] || 'object';
  }

  // Map description
  if (schema.description) {
    result.description = schema.description;
  }

  // Map properties for object type
  if (schema.properties) {
    result.properties = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      result.properties[key] = schemaToOpenAISchema(value);
    }
  }

  // Map required fields
  if (schema.required) {
    result.required = schema.required;
  }

  // Map array items
  if (schema.items) {
    result.items = schemaToOpenAISchema(schema.items);
  }

  // Map enum values
  if (schema.enum) {
    result.enum = schema.enum;
  }

  // Map format
  if (schema.format) {
    result.format = schema.format;
  }

  // Map nullable
  if (schema.nullable) {
    result.nullable = schema.nullable;
  }

  return result;
}

/**
 * Converts an array of Gemini Tools to OpenAI Tools
 */
export function toolsToOpenAITools(tools?: Tool[]): OpenAITool[] | undefined {
  if (!tools || tools.length === 0) {
    return undefined;
  }

  return tools.map(toolToOpenAITool);
}