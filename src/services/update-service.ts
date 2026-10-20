/**
 * ClimatOSCOPE — System Update & PWA Background Synchronization Service
 * Handles background version discovery, Service Worker lifecycle, and cache refreshes.
 */

export const APP_RELEASE_DATE = '20 octobre 2026';
export const APP_VERSION = 'v0.7.0';
export const BUILD_COMMIT = 'cf-pages-20261020';

const STORAGE_KEY_LAST_CHECK = 'climatoscope_last_update_check';

export interface UpdateStatus {
  isChecking: boolean;
  lastCheckDate: string | null;
  hasUpdate: boolean;
  message: string;
  releaseDate: string;
  version: string;
}

type UpdateListener = (status: UpdateStatus) => void;

class UpdateService {
  private listeners: Set<UpdateListener> = new Set();
  private isChecking = false;
  private hasUpdate = false;
  private message = 'Votre application est à jour avec la dernière version officielle.';
  private checkIntervalId: any = null;

  constructor() {
    this.initBackgroundWorker();
  }

  private getLastCheckDate(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY_LAST_CHECK);
  }

  private setLastCheckDate(isoString: string) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_LAST_CHECK, isoString);
    } catch {
      // storage quota or incognito
    }
  }

  getStatus(): UpdateStatus {
    return {
      isChecking: this.isChecking,
      lastCheckDate: this.getLastCheckDate(),
      hasUpdate: this.hasUpdate,
      message: this.message,
      releaseDate: APP_RELEASE_DATE,
      version: APP_VERSION,
    };
  }

  subscribe(listener: UpdateListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach((listener) => listener(status));
  }

  private initBackgroundWorker() {
    if (typeof window === 'undefined') return;

    // 1. Initial check after startup
    setTimeout(() => {
      this.checkForUpdates(false);
    }, 4000);

    // 2. Periodic background verification every 30 minutes
    this.checkIntervalId = setInterval(() => {
      this.checkForUpdates(false);
    }, 30 * 60 * 1000);

    // 3. Background check when window regains visibility
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const last = this.getLastCheckDate();
        if (!last || Date.now() - new Date(last).getTime() > 15 * 60 * 1000) {
          this.checkForUpdates(false);
        }
      }
    });

    // 4. Background check when device reconnects
    window.addEventListener('online', () => {
      this.checkForUpdates(false);
    });

    // 5. Listen to Service Worker state transitions
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Automatically refreshed when controller changes
        this.message = 'Nouvelle version activée automatiquement en arrière-plan.';
        this.notify();
      });
    }
  }

  /**
   * Check for updates both via Service Worker and network head probe
   */
  async checkForUpdates(isUserInitiated = true): Promise<boolean> {
    if (this.isChecking) return this.hasUpdate;

    this.isChecking = true;
    this.message = 'Vérification de la disponibilité de nouvelles versions...';
    this.notify();

    let foundNewVersion = false;

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // Trigger SW network update probe
          await registration.update();

          // Check if a new worker is installed and waiting
          if (registration.waiting) {
            foundNewVersion = true;
          }
        }
      }

      // Record successful verification timestamp
      const nowIso = new Date().toISOString();
      this.setLastCheckDate(nowIso);

      if (foundNewVersion) {
        this.hasUpdate = true;
        this.message = 'Une nouvelle version de ClimatOSCOPE est prête à être installée !';
      } else {
        this.hasUpdate = false;
        this.message = isUserInitiated
          ? 'Votre application est parfaitement à jour (dernières données scientifiques en cache).'
          : 'Application à jour.';
      }
    } catch (err) {
      console.warn('Vérification des mises à jour impossible (mode hors-ligne ou réseau restreint):', err);
      this.message = 'Impossible de contacter le serveur distant. Vous utilisez la version locale en cache.';
    } finally {
      this.isChecking = false;
      this.notify();
    }

    return foundNewVersion;
  }

  /**
   * Force update: clears Service Worker caches and reloads application
   */
  async forceUpdate(): Promise<void> {
    this.isChecking = true;
    this.message = 'Actualisation forcée des caches et téléchargement de la dernière version...';
    this.notify();

    try {
      // 1. Tell waiting service worker to skip waiting
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg?.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }

      // 2. Clear workbox / runtime cache
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }

      // 3. Update verification timestamp
      this.setLastCheckDate(new Date().toISOString());

      // 4. Reload page cleanly bypassing browser cache
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error('Erreur lors du forçage de mise à jour:', err);
      window.location.reload();
    }
  }

  destroy() {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
    }
    this.listeners.clear();
  }
}

export const updateService = new UpdateService();
