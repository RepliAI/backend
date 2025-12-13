import { GetGmailStatusUseCase, GetGmailStatusOutput } from "src/application/gmail/use-cases/get-gmail-status.usecase";
import { createGmailRepositoryMock } from "src/tests/mocks/gmail-repository.mock";

describe("GetGmailStatusUseCase", () => {
  it("should return connected = true when token exists", async () => {
    const repo = createGmailRepositoryMock();
    repo.hasToken.mockResolvedValue(true);

    const usecase = new GetGmailStatusUseCase(repo);

    const result = await usecase.execute("user-123");

    expect(result).toBeInstanceOf(GetGmailStatusOutput);
    expect(result.connected).toBe(true);
    expect(repo.hasToken).toHaveBeenCalledWith("user-123");
  });

  it("should return connected = false when token does not exist", async () => {
    const repo = createGmailRepositoryMock();
    repo.hasToken.mockResolvedValue(false);

    const usecase = new GetGmailStatusUseCase(repo);

    const result = await usecase.execute("user-123");

    expect(result.connected).toBe(false);
    expect(repo.hasToken).toHaveBeenCalledWith("user-123");
  });

  it("should throw an error when repository fails", async () => {
    const repo = createGmailRepositoryMock();
    repo.hasToken.mockRejectedValue(new Error("Database error"));

    const usecase = new GetGmailStatusUseCase(repo);

    await expect(usecase.execute("user-123")).rejects.toThrow("Database error");
    expect(repo.hasToken).toHaveBeenCalledWith("user-123");
  });
});