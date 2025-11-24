import { AuthService } from '../src/backend/services';

async function main() {
  try {
    const result = await AuthService.login({
      email: 'admin@fotografia.com',
      password: '123456',
    });

    console.log('Login result:', result);
  } catch (error) {
    console.error('Login failed:', error);
  }
}

main().finally(() => process.exit(0));
