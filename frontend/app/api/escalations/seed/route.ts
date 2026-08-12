import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const scriptPath = path.resolve(process.cwd(), '../backend/src/escalation_api.py');
    const backendDir = path.resolve(process.cwd(), '../backend');

    const cmd = `uv run python "${scriptPath}" seed`;
    const { stdout } = await execAsync(cmd, { cwd: backendDir });
    const result = JSON.parse(stdout.trim());

    if (result.status === 'success') {
      return NextResponse.json({ success: true, seeded: result.seeded, data: result.data });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to seed escalations' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API POST /api/escalations/seed error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to seed demo data' },
      { status: 500 }
    );
  }
}
