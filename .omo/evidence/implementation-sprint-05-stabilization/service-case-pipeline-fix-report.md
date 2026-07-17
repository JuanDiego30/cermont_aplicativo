# ServiceCase Invoice Pipeline Fix Report

## Original Error
service-case.controller.ts:186 — Property 'getInvoicePipeline' does not exist on ServiceCaseService.

## Actual State
The function `getInvoicePipeline` **exists and is exported** from service-case.service.ts. Backend typecheck passes clean — no error exists.

## Route
```ts
router.get("/:id/invoice-pipeline", authorize(...INTERNAL_ROLES), validateParams(...), getInvoicePipeline);
```

## Decision
The endpoint is real (frontend + route exist). Current implementation returns stub data. No changes needed — typecheck passes, and feature implementation is outside stabilization scope.
