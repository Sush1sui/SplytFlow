import { CreateEarningDTO, CreateSplitConfigDTO } from "@splytflow/types";

// Define the API client type structure to match the server routes
export type ApiClient = {
  earnings: {
    $post: (
      req: { json: CreateEarningDTO },
      options?: { headers?: Record<string, string> }
    ) => Promise<Response>;
    $get: (
      req: { query?: Record<string, string> },
      options?: { headers?: Record<string, string> }
    ) => Promise<Response>;
    summary: {
      $get: (
        req: { query?: Record<string, string> },
        options?: { headers?: Record<string, string> }
      ) => Promise<Response>;
    };
    [key: string]: any; // For dynamic routes like ":id"
  };
  "split-configs": {
    $post: (
      req: { json: CreateSplitConfigDTO },
      options?: { headers?: Record<string, string> }
    ) => Promise<Response>;
    $get: (
      req: { query?: Record<string, string> },
      options?: { headers?: Record<string, string> }
    ) => Promise<Response>;
    reorder: {
      $post: (
        req: { json: { order: number[] } },
        options?: { headers?: Record<string, string> }
      ) => Promise<Response>;
    };
    [key: string]: any; // For dynamic routes like ":id"
  };
  db: Record<string, any>;
  auth: Record<string, any>;
};
