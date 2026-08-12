import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urgency = searchParams.get('urgency') || 'all';
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    const scriptPath = path.resolve(process.cwd(), '../backend/src/escalation_api.py');
    const backendDir = path.resolve(process.cwd(), '../backend');

    const cmd = `uv run python "${scriptPath}" list --urgency "${urgency}" --status "${status}" --search "${search}"`;

    const { stdout } = await execAsync(cmd, { cwd: backendDir });
    const result = JSON.parse(stdout.trim());

    if (result.status === 'success') {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json({ success: false, error: result.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error('API GET /api/escalations error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch escalations' },
      { status: 500 }
    );
  }
}
