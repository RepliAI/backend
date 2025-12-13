import { RegisterUserUseCase } from '../register-user.usecase';
import { UserAlreadyExistsError } from 'src/domain/shared/errors/user-already-exist.errors';
import { createUserRepoMock } from 'src/tests/mocks/user-repo.mock';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: ReturnType<typeof createUserRepoMock>;

  beforeEach(() => {
    userRepository = createUserRepoMock();
    useCase = new RegisterUserUseCase(userRepository as any);
  });

  it('should create a new user', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await useCase.execute({
      email: 'test@test.com',
      password: 'password123',
    });

    expect(userRepository.create).toHaveBeenCalled();
  });

  it('should throw if user already exists', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: '1' });

    await expect(
      useCase.execute({ email: 'test@test.com', password: '123' })
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });
});