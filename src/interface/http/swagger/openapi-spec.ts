export const openApiSpec: Record<string, unknown> = {
  openapi: "3.0.3",
  info: {
    title: "Task Management Service",
    version: "1.0.0",
    description: "RESTful API for managing tasks with status workflows, filtering, and pagination.",
  },
  servers: [
    {
      url: "/",
      description: "Current server",
    },
  ],
  tags: [
    { name: "Health", description: "Health and readiness probes" },
    { name: "Tasks", description: "Task CRUD and status management" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        operationId: "getHealth",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    timestamp: { type: "string", format: "date-time" },
                    uptime: { type: "number", example: 123.45 },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/ready": {
      get: {
        tags: ["Health"],
        summary: "Readiness probe",
        operationId: "getReady",
        responses: {
          "200": {
            description: "Service is ready",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ready" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "List tasks",
        operationId: "listTasks",
        parameters: [
          {
            name: "status",
            in: "query",
            schema: { $ref: "#/components/schemas/TaskStatus" },
          },
          {
            name: "priority",
            in: "query",
            schema: { $ref: "#/components/schemas/TaskPriority" },
          },
          {
            name: "assigneeId",
            in: "query",
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "search",
            in: "query",
            description: "Text search on title and description",
            schema: { type: "string", maxLength: 200 },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          "200": {
            description: "Paginated list of tasks",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Task" },
                    },
                    total: { type: "integer", example: 42 },
                    page: { type: "integer", example: 1 },
                    limit: { type: "integer", example: 20 },
                    totalPages: { type: "integer", example: 3 },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
        },
      },
      post: {
        tags: ["Tasks"],
        summary: "Create a task",
        operationId: "createTask",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTask" },
            },
          },
        },
        responses: {
          "201": {
            description: "Task created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Task" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
        },
      },
    },
    "/api/v1/tasks/{id}": {
      get: {
        tags: ["Tasks"],
        summary: "Get a task by ID",
        operationId: "getTask",
        parameters: [{ $ref: "#/components/parameters/TaskId" }],
        responses: {
          "200": {
            description: "Task found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Task" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      patch: {
        tags: ["Tasks"],
        summary: "Update task details",
        operationId: "updateTask",
        parameters: [{ $ref: "#/components/parameters/TaskId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTask" },
            },
          },
        },
        responses: {
          "200": {
            description: "Task updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Task" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete a task",
        operationId: "deleteTask",
        parameters: [{ $ref: "#/components/parameters/TaskId" }],
        responses: {
          "204": { description: "Task deleted" },
          "400": { $ref: "#/components/responses/ValidationError" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/v1/tasks/{id}/status": {
      patch: {
        tags: ["Tasks"],
        summary: "Transition task status",
        operationId: "updateTaskStatus",
        description:
          "Valid transitions: PENDING → IN_PROGRESS, PENDING → CANCELLED, IN_PROGRESS → COMPLETED, IN_PROGRESS → CANCELLED. Terminal states (COMPLETED, CANCELLED) cannot transition.",
        parameters: [{ $ref: "#/components/parameters/TaskId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { $ref: "#/components/schemas/TaskStatus" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Status updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Task" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
  },
  components: {
    schemas: {
      TaskStatus: {
        type: "string",
        enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      },
      TaskPriority: {
        type: "string",
        enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      },
      Task: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string", example: "Implement login page" },
          description: { type: "string", example: "Build the OAuth2 login flow" },
          status: { $ref: "#/components/schemas/TaskStatus" },
          priority: { $ref: "#/components/schemas/TaskPriority" },
          assigneeId: { type: "string", format: "uuid", nullable: true },
          dueDate: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          tags: {
            type: "array",
            items: { type: "string" },
            example: ["backend", "auth"],
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateTask: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", minLength: 1, maxLength: 255, example: "Implement login page" },
          description: { type: "string", maxLength: 5000 },
          priority: { $ref: "#/components/schemas/TaskPriority" },
          assigneeId: { type: "string", format: "uuid" },
          dueDate: { type: "string", format: "date-time" },
          tags: {
            type: "array",
            items: { type: "string", maxLength: 50 },
            maxItems: 20,
          },
        },
      },
      UpdateTask: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 1, maxLength: 255 },
          description: { type: "string", maxLength: 5000 },
          priority: { $ref: "#/components/schemas/TaskPriority" },
          assigneeId: { type: "string", format: "uuid", nullable: true },
          dueDate: { type: "string", format: "date-time", nullable: true },
          tags: {
            type: "array",
            items: { type: "string", maxLength: 50 },
            maxItems: 20,
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
          code: { type: "string" },
          details: {
            type: "object",
            additionalProperties: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      },
    },
    parameters: {
      TaskId: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
        description: "Task UUID",
      },
    },
    responses: {
      ValidationError: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },
};
