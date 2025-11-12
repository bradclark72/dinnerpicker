export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

function formatContextForLLM(context: SecurityRuleContext): string {
  const prettyContext = {
    auth: {
      /* This will be populated by the server with the user's auth context */
    },
    method: context.operation,
    path: `/databases/(default)/documents${context.path}`,
    ...(context.requestResourceData && {
      request: {
        resource: {
          data: context.requestResourceData,
        },
      },
    }),
  };

  return JSON.stringify(prettyContext, null, 2);
}

export class FirestorePermissionError extends Error {
  constructor(context: SecurityRuleContext) {
    const llmFormattedContext = formatContextForLLM(context);
    const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${llmFormattedContext}`;
    super(message);
    this.name = 'FirestorePermissionError';
  }
}
