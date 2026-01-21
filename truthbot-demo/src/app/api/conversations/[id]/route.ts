import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Cache for conversation lookups
let conversationLookup: Map<string, string> | null = null;

async function buildLookup(): Promise<Map<string, string>> {
  if (conversationLookup) return conversationLookup;

  const lookup = new Map<string, string>();
  const resultsDir = path.resolve(process.cwd(), '../data/results');

  try {
    const runDirs = fs.readdirSync(resultsDir).filter(d => {
      const fullPath = path.join(resultsDir, d);
      return fs.statSync(fullPath).isDirectory();
    });

    for (const runDir of runDirs) {
      const runPath = path.join(resultsDir, runDir);
      const files = fs.readdirSync(runPath).filter(f =>
        f.endsWith('.json') &&
        !f.includes('metadata') &&
        !f.includes('summary') &&
        !f.includes('checkpoint')
      );

      for (const file of files) {
        // Extract UUID from filename
        const id = file.replace('.json', '');
        lookup.set(id, path.join(runPath, file));
      }
    }
  } catch (error) {
    console.error('Error building conversation lookup:', error);
  }

  conversationLookup = lookup;
  return lookup;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lookup = await buildLookup();
    const filePath = lookup.get(id);

    if (!filePath) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading conversation:', error);
    return NextResponse.json(
      { error: 'Failed to load conversation' },
      { status: 500 }
    );
  }
}
