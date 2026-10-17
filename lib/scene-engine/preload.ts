/**
 * In-memory decoded image cache holding at most 3 HTMLImageElements.
 */
class ImagePreloadCache {
  private cache = new Map<string, HTMLImageElement>();
  private readonly maxEntries = 3;

  public async preloadAndDecode(url: string, timeoutMs: number = 10000): Promise<boolean> {
    if (typeof window === "undefined") return false;

    // Already decoded and cached
    if (this.cache.has(url)) {
      return true;
    }

    return new Promise<boolean>((resolve) => {
      let isSettled = false;
      const img = new Image();

      const timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          resolve(false);
        }
      }, timeoutMs);

      img.src = url;

      img
        .decode()
        .then(() => {
          if (!isSettled) {
            isSettled = true;
            clearTimeout(timer);

            // Enforce max 3 items in memory
            if (this.cache.size >= this.maxEntries) {
              const oldestKey = this.cache.keys().next().value;
              if (oldestKey) {
                this.cache.delete(oldestKey);
              }
            }

            this.cache.set(url, img);
            resolve(true);
          }
        })
        .catch(() => {
          if (!isSettled) {
            isSettled = true;
            clearTimeout(timer);
            resolve(false);
          }
        });
    });
  }

  public isDecoded(url: string): boolean {
    return this.cache.has(url);
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const imagePreloadCache = new ImagePreloadCache();

