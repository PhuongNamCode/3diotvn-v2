export type GoogleJwt = {
  name?: string;
  email?: string;
  picture?: string;
  sub?: string;
};

export function getGsi() {
  return (typeof window !== 'undefined' ? (window as any).google?.accounts?.id : undefined);
}

export function initGsi(clientId: string, callback: (response: any) => void) {
  const g = getGsi();
  if (!g || !clientId) return false;
  g.initialize({
    client_id: clientId,
    callback,
    auto_select: false,
    cancel_on_tap_outside: true,
    use_fedcm_for_prompt: true,
  });
  return true;
}

export function renderGsiButton(target: HTMLElement) {
  const g = getGsi();
  if (!g || !target) return false;
  g.renderButton(target, {
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
    logo_alignment: 'left',
    width: 320,
  });
  return true;
}

export function promptSignIn() {
  const g = getGsi();
  if (!g) return false;
  g.prompt();
  return true;
}

export function disableAutoSelect() {
  const g = getGsi();
  if (!g) return false;
  g.disableAutoSelect();
  return true;
}

export function revokeByEmail(email: string, cb?: () => void) {
  const g = getGsi();
  if (!g || !email) return false;
  g.revoke(email, () => { if (cb) cb(); });
  return true;
}
