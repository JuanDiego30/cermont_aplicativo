import { NotificationsService } from "./notifications.service";

describe(NotificationsService.name, () => {
  it("delegates sendEmail to EmailService", async () => {
    const emailService = {
      sendEmail: jest.fn().mockResolvedValue({ messageId: "x" }),
    } as any;

    const emailQueue = {
      enqueue: jest.fn(),
      enqueueBatch: jest.fn(),
    } as any;

    const service = new NotificationsService(emailService, emailQueue);

    const result = await service.sendEmail({
      to: "a@b.com",
      subject: "Hola",
      text: "Texto",
    });

    expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
    expect(result.messageId).toBe("x");
  });
});
