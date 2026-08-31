import { describe, it, expect, vi } from 'vitest';
import { authService, supabase } from '../src/utils/supabaseClient';

describe('Auth & Password Reset Suite', () => {
  it('should request password reset with redirect URL', async () => {
    const spy = vi.spyOn(supabase.auth, 'resetPasswordForEmail').mockResolvedValueOnce({
      data: {} as any,
      error: null,
    });

    const email = 'teststaff@cafeorder.com';
    await authService.resetPasswordForEmail(email);

    expect(spy).toHaveBeenCalledWith(
      email,
      expect.objectContaining({
        redirectTo: expect.stringMatching(/https?:\/\//),
      })
    );
  });

  it('should update password via supabase.auth.updateUser', async () => {
    const spy = vi.spyOn(supabase.auth, 'updateUser').mockResolvedValueOnce({
      data: { user: { id: 'u1' } } as any,
      error: null,
    });

    const newPass = 'StrongPass123!';
    await authService.updatePassword(newPass);

    expect(spy).toHaveBeenCalledWith({
      password: newPass,
    });
  });

  it('should listen to onAuthStateChange and receive PASSWORD_RECOVERY event', () => {
    let capturedCallback: any;
    vi.spyOn(supabase.auth, 'onAuthStateChange').mockImplementationOnce((cb: any) => {
      capturedCallback = cb;
      return { data: { subscription: { unsubscribe: vi.fn(), id: '1', callback: cb } } };
    });

    let receivedEvent = '';
    authService.onAuthStateChange((user, session, event) => {
      if (event) receivedEvent = event;
    });

    expect(capturedCallback).toBeDefined();
    capturedCallback('PASSWORD_RECOVERY', { user: { id: 'recovery-user' } });
    expect(receivedEvent).toBe('PASSWORD_RECOVERY');
  });

  it('should validate password length and matching requirements', () => {
    const validate = (p1: string, p2: string) => {
      if (!p1 || p1.length < 6) return 'Password must be at least 6 characters long';
      if (p1 !== p2) return 'Passwords do not match';
      return null;
    };

    expect(validate('', '')).toBe('Password must be at least 6 characters long');
    expect(validate('12345', '12345')).toBe('Password must be at least 6 characters long');
    expect(validate('password123', 'different123')).toBe('Passwords do not match');
    expect(validate('securePassword123', 'securePassword123')).toBeNull();
  });
});
