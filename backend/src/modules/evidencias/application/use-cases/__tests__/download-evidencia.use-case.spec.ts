import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { DownloadEvidenciaUseCase } from "../download-evidencia.use-case";
import { EVIDENCIA_REPOSITORY } from "../../../domain/repositories";
import { STORAGE_PROVIDER } from "../../../infrastructure/storage/storage-provider.interface";
import { ORDEN_REPOSITORY } from "../../../../ordenes/domain/repositories";

describe("DownloadEvidenciaUseCase", () => {
  const repo = {
    findById: jest.fn(),
  } as any;

  const storage = {
    exists: jest.fn(),
    download: jest.fn(),
  } as any;

  const ordenRepo = {
    findById: jest.fn(),
  } as any;

  const makeUseCase = () =>
    new DownloadEvidenciaUseCase(repo, storage, ordenRepo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws 403 when user cannot access orden", async () => {
    repo.findById.mockResolvedValue({
      ordenId: "orden-1",
      storagePath: { getValue: () => "orden/orden-1/file.bin" },
      mimeType: {
        getExtension: () => "pdf",
        getValue: () => "application/pdf",
      },
      originalFilename: "doc.pdf",
      id: { getValue: () => "evi-1" },
    });

    ordenRepo.findById.mockResolvedValue({
      creadorId: "user-a",
      asignadoId: "user-b",
    });

    await expect(
      makeUseCase().execute({ id: "evi-1", requestedBy: "user-x" }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(storage.download).not.toHaveBeenCalled();
  });

  it("allows admin role bypass", async () => {
    repo.findById.mockResolvedValue({
      ordenId: "orden-1",
      storagePath: { getValue: () => "orden/orden-1/file.bin" },
      mimeType: {
        getExtension: () => "pdf",
        getValue: () => "application/pdf",
      },
      originalFilename: "doc.pdf",
      id: { getValue: () => "evi-1" },
    });

    ordenRepo.findById.mockResolvedValue({
      creadorId: "user-a",
      asignadoId: "user-b",
    });

    storage.exists.mockResolvedValue(true);
    storage.download.mockResolvedValue(Buffer.from("ok"));

    const result = await makeUseCase().execute({
      id: "evi-1",
      requestedBy: "user-x",
      requesterRole: "admin",
    });

    expect(result.mimeType).toBe("application/pdf");
  });

  it("throws 404 when orden not found", async () => {
    repo.findById.mockResolvedValue({
      ordenId: "orden-404",
      storagePath: { getValue: () => "orden/orden-404/file.bin" },
      mimeType: {
        getExtension: () => "pdf",
        getValue: () => "application/pdf",
      },
      originalFilename: "doc.pdf",
      id: { getValue: () => "evi-1" },
    });

    ordenRepo.findById.mockResolvedValue(null);

    await expect(
      makeUseCase().execute({ id: "evi-1", requestedBy: "user-a" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
