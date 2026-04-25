/**
 * Loads all phones. Supports two sources:
 * 1. Individual files in src/data/phones/ (preferred for new additions)
 * 2. Legacy src/data/phones.json (existing phones)
 *
 * Over time, phones should be migrated to individual files.
 * The phones.json will eventually be removed entirely.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..', '..');
const PHONES_DIR = join(PROJECT_ROOT, 'src/data/phones');
const PHONES_JSON = join(PROJECT_ROOT, 'src/data/phones.json');

function loadPhonesFromDir(): any[] {
  try {
    const files = readdirSync(PHONES_DIR).filter(f => f.endsWith('.json'));
    return files.map(file => {
      const data = readFileSync(join(PHONES_DIR, file), 'utf-8');
      return JSON.parse(data);
    });
  } catch {
    return [];
  }
}

function loadPhonesFromJson(): any[] {
  try {
    const data = readFileSync(PHONES_JSON, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Returns all phones merged from both sources.
 * Individual files take precedence over phones.json (avoids duplicates).
 */
export function getAllPhones(): any[] {
  const fromDir = loadPhonesFromDir();
  const fromJson = loadPhonesFromJson();

  // Build a map by id from phones.json
  const byId = new Map(fromJson.map(p => [p.id, p]));

  // Override with individual files (newer data takes precedence)
  fromDir.forEach(p => byId.set(p.id, p));

  return Array.from(byId.values());
}

/**
 * Returns a single phone by slug, checking individual files first.
 */
export function getPhoneBySlug(slug: string): any | undefined {
  // Try individual file first
  try {
    const filePath = join(PHONES_DIR, `${slug}.json`);
    const data = readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    // Fall back to phones.json
    const all = getAllPhones();
    return all.find(p => p.slug === slug);
  }
}

export { PHONES_DIR, PHONES_JSON };
