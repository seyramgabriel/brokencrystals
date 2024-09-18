import { Test, TestingModule } from '@nestjs/testing';
import { KeyCloakService } from '../keycloak/keycloak.service';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UsersService,
          useValue: {}
        },
        {
          provide: KeyCloakService,
          useValue: {}
        },
        {
          provide: AuthService,
          useValue: {}
        }
      ]
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
