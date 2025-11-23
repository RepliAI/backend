import { IIdGenerator } from "src/domain/shared/services/id-generator.service";

export function createIdGeneratorMock(): jest.Mocked<IIdGenerator> {
  return {
    generate: jest.fn(),
  };
}