import { openai } from '@ai-sdk/openai';
import { Agent } from '@convex-dev/agent';
import { components } from '../../../_generated/api';

export const supportAgent = new Agent(components.agent, {
  name: 'Support Agent',
  languageModel: openai.chat('gpt-4o-mini'),
  instructions: `You are a customer support agent. 
    Use "resolveConversationTool" tool when user expresses finalization of the conversation. 
    Use "escalateConversationTool" tool when user expresses frustration, or requests a human explicitly.`,
});
