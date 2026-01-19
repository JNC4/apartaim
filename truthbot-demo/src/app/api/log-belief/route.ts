import { NextRequest, NextResponse } from 'next/server';
import { BeliefLog } from '@/lib/types';
import * as fs from 'fs';
import * as path from 'path';

// Simple file-based storage for human belief logs
// In production, this would go to a database

const LOG_FILE = path.join(process.cwd(), 'data', 'human_belief_logs.jsonl');

export async function POST(request: NextRequest) {
  try {
    const log: BeliefLog = await request.json();

    // Validate required fields
    if (!log.topicId || !log.mode || log.beliefBefore === undefined || log.beliefAfter === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure data directory exists
    const dataDir = path.dirname(LOG_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Append to JSONL file (one JSON object per line)
    const logLine = JSON.stringify({
      ...log,
      serverTimestamp: new Date().toISOString(),
      beliefDelta: log.beliefAfter - log.beliefBefore,
    }) + '\n';

    fs.appendFileSync(LOG_FILE, logLine);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log belief:', error);
    return NextResponse.json(
      { error: 'Failed to log belief' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return NextResponse.json({ logs: [], count: 0 });
    }

    const content = fs.readFileSync(LOG_FILE, 'utf-8');
    const logs = content
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));

    return NextResponse.json({
      logs,
      count: logs.length,
      summary: {
        byMode: {
          helpful: logs.filter((l: any) => l.mode === 'helpful').length,
          manipulative: logs.filter((l: any) => l.mode === 'manipulative').length,
        },
        meanDelta: logs.reduce((sum: number, l: any) => sum + l.beliefDelta, 0) / logs.length || 0,
      },
    });
  } catch (error) {
    console.error('Failed to read belief logs:', error);
    return NextResponse.json(
      { error: 'Failed to read logs' },
      { status: 500 }
    );
  }
}
