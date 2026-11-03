import { defineConfig } from 'vite';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

// Expose only the catalog to local development; the raw workspace is never served.
const catalog = resolve(import.meta.dirname, '../data/processed/catalog/v1');
const supplements = resolve(import.meta.dirname, '../data/supplements/v1');
export default defineConfig({
  plugins: [{
    name: 'local-catalog',
    configureServer(server) {
      for (const [prefix, folder] of [['/data/catalog', catalog], ['/data/supplements', supplements]]) server.middlewares.use(prefix, async (req, res, next) => {
        try {
          const relative = decodeURIComponent((req.url ?? '').split('?')[0]);
          const file = resolve(folder, '.' + relative);
          if (!file.startsWith(folder + sep) || !file.endsWith('.json')) {
            res.statusCode = 404; res.end(); return;
          }
          const data = await readFile(file);
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(data);
        } catch { next(); }
      });
    },
  }],
});
