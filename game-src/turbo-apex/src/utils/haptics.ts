/**
 * Android Vibration API wrapper with user preference toggle
 */
class HapticsEngine {
  private enabled = true;

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public getEnabled() {
    return this.enabled;
  }

  private trigger(pattern: number | number[]) {
    if (!this.enabled || typeof window === 'undefined') return;
    try {
      if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch {}
  }

  public light() {
    this.trigger(15);
  }

  public medium() {
    this.trigger(35);
  }

  public heavy() {
    this.trigger([50, 40, 80]);
  }

  public nitro() {
    this.trigger([25, 20, 30, 20, 40]);
  }

  public coin() {
    this.trigger(12);
  }

  public powerup() {
    this.trigger([20, 30, 30]);
  }
}

export const haptics = new HapticsEngine();
