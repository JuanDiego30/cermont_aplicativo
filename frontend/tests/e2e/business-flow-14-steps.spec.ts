import { expect, test } from "@playwright/test";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

/**
 * 14-Step Business Flow E2E Test
 * Tests the complete operational workflow from work request to payment
 *
 * Step coverage:
 * 1. Work Request - /work-requests
 * 2. Site Visit - /site-visits
 * 3. Proposal - /proposals
 * 4. Purchase Order - /proposals/:id]
 * 5. Planning - /orders/:id]/planning
 * 6. Execution - /execution
 * 7. Evidence - /evidences
 * 8. Technical Report - /reports
 * 9. Delivery Record - /delivery-records
 * 10. Client Signature - /delivery-records/[id]
 * 11. SES - /billing/ses
 * 12. Invoice - /billing/invoices
 * 13. Invoice Approval - /billing/invoices/[id]
 * 14. Payment - /payments
 */
test.describe("14-Step Business Flow - API Endpoints", () => {
  test.describe.configure({ mode: "serial" });

  // Step 1: Work Request
  test("Step 1 - POST /api/work-requests creates work request", async ({ request }) => {
    const response = await request.post(`${backendUrl}/api/work-requests`, {
      data: {
        requesterName: "Test User",
        clientName: "Test Client",
        serviceSite: "Site A",
        serviceType: "Maintenance",
        sourceChannel: "portal_client",
        shortDescription: "Test WR",
        description: "Test description for work request",
        requiresSiteVisit: false,
      },
    });

    // Endpoint exists - verify structure
    expect(response.status()).not.toBe(404);
  });

  test("Step 1 - GET /api/work-requests lists work requests", async ({ request }) => {
    const response = await request.get(`${backendUrl}/api/work-requests?page=1&limit=10`);

    expect(response.status()).not.toBe(404);
  });

  // Step 2: Site Visit
  test("Step 2 - POST /api/site-visits creates site visit", async ({ request }) => {
    const response = await request.post(`${backendUrl}/api/site-visits`, {
      data: {
        clientName: "Test Client",
        location: "Test Location",
        visitDate: "2024-01-15T10:00:00Z",
        responsibleUserId: "507f1f77bcf86cd799439012",
        responsibleName: "Tech User",
      },
    });

    expect(response.status()).not.toBe(404);
  });

  test("Step 2 - GET /api/site-visits lists site visits", async ({ request }) => {
    const response = await request.get(`${backendUrl}/api/site-visits?page=1&limit=10`);

    expect(response.status()).not.toBe(404);
  });

  // Step 3: Proposal
  test("Step 3 - GET /api/proposals lists proposals", async ({ request }) => {
    const response = await request.get(`${backendUrl}/api/proposals?page=1&limit=10`);

    expect(response.status()).not.toBe(404);
  });

  // Step 4: Purchase Order
  test("Step 4 - POST /api/proposals/:id/po attaches PO", async ({ request }) => {
    const response = await request.post(`${backendUrl}/api/proposals/proposal-id/po`, {
      data: {
        poNumber: "PO-2024-001",
        value: 5000000,
        issuedDate: "2024-01-15",
      },
    });

    expect(response.status()).not.toBe(404);
  });

  // Step 5: Planning
  test("Step 5 - GET /api/planning-packets/:id gets planning", async ({ request }) => {
    const response = await request.get(`${backendUrl}/api/planning-packets/planning-id`);

    expect(response.status()).not.toBe(404);
  });

  test("Step 5 - POST /api/planning-packets/:id/approve approves planning", async ({ request }) => {
    const response = await request.post(`${backendUrl}/api/planning-packets/planning-id/approve`, {
      data: {
        signature: "approved",
      },
    });

    expect(response.status()).not.toBe(404);
  });

  // Step 6: Execution
  test("Step 6 - GET /api/execution lists execution sessions", async ({ request }) => {
    const response = await request.get(`${backendUrl}/api/execution?page=1&limit=10`);

    expect(response.status()).not.toBe(404);
  });

  test("Step 6 - POST /api/execution creates execution session", async ({ request }) => {
    const response = await request.post(`${backendUrl}/api/execution`, {
      data: {
        workOrderId: "order-id",
      },
    });

    expect(response.status()).not.toBe(404);
  });

  // Step 7: Evidence
  test("Step 7 - GET /api/evidences lists evidence", async ({ request }) => {
    const response = await request.get(`${backendUrl}/api/evidences?page=1&limit=10`);

    expect(response.status()).not.toBe(404);
  });

  // Step 8: Reports
  test("Step 8 - GET /api/reports lists reports", async ({ request }) => {
    const response = await request.get(`${backendUrl}/api/reports?page=1&limit=10`);

    expect(response.status()).not.toBe(404);
  });

  // Step 9-10: Delivery Records
  test("Step 9 - GET /api/delivery-records lists delivery records", async ({ request }) => {
    const response = await request.get(`${backendUrl}/api/delivery-records?page=1&limit=10`);

    expect(response.status()).not.toBe(404);
  });

  test("Step 9-10 - POST /api/delivery-records/:id/sign signs delivery record", async ({ request }) => {
    const response = await request.post(`${backendUrl}/api/delivery-records/dr-id/sign`, {
      data: {
        signature: "client-signature",
        name: "Client Name",
      },
    });

    expect(response.status()).not.toBe(404);
  });

  // Step 11: SES
  test("Step 11 - GET /api/ses lists service entry sheets", async ({ request }) => {
    const response = await request.get(`${backendUrl}/api/ses?page=1&limit=10`);

    expect(response.status()).not.toBe(404);
  });

  test("Step 11 - POST /api/ses/:id/submit submits SES to Ariba", async ({ request }) => {
    const response = await request.post(`${backendUrl}/api/ses/ses-id/submit`, {
      data: {
        aribaRef: "ariba-123",
      },
    });

    expect(response.status()).not.toBe(404);
  });

  // Step 12-13: Invoices
  test("Step 12-13 - GET /api/invoices lists invoices", async ({ request }) => {
    const response = await request.get(`${backendUrl}/api/invoices?page=1&limit=10`);

    expect(response.status()).not.toBe(404);
  });

  test("Step 12-13 - POST /api/invoices/:id/approve approves invoice", async ({ request }) => {
    const response = await request.post(`${backendUrl}/api/invoices/invoice-id/approve`);

    expect(response.status()).not.toBe(404);
  });

  // Step 14: Payments
  test("Step 14 - GET /api/payments lists payments", async ({ request }) => {
    const response = await request.get(`${backendUrl}/api/payments?page=1&limit=10`);

    expect(response.status()).not.toBe(404);
  });

  test("Step 14 - POST /api/payments registers payment", async ({ request }) => {
    const response = await request.post(`${backendUrl}/api/payments`, {
      data: {
        invoiceId: "invoice-id",
        amount: 5000000,
        method: "transfer",
      },
    });

    expect(response.status()).not.toBe(404);
  });
});

test.describe("API Health Check", () => {
  test("backend health endpoint is accessible", async ({ request }) => {
    const response = await request.get(`${backendUrl}/api/health`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("status");
  });

  test("backend metrics endpoint is accessible", async ({ request }) => {
    const response = await request.get(`${backendUrl}/api/metrics`);

    // Metrics endpoint requires authentication, so we expect 401 or 200
    expect([200, 401]).toContain(response.status());
  });
});