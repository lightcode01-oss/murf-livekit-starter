import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outcome = searchParams.get('outcome') || 'all';
    const channel = searchParams.get('channel') || 'all';
    const limit = searchParams.get('limit') || '50';

    const scriptPath = path.resolve(process.cwd(), '../backend/src/analytics_api.py');
    const backendDir = path.resolve(process.cwd(), '../backend');

    // Run summary command
    const summaryCmd = `uv run python "${scriptPath}" summary`;
    const { stdout: summaryStdout } = await execAsync(summaryCmd, { cwd: backendDir });
    const summaryResult = JSON.parse(summaryStdout.trim());

    // Run recent list command
    const recentCmd = `uv run python "${scriptPath}" recent --outcome "${outcome}" --channel "${channel}" --limit ${limit}`;
    const { stdout: recentStdout } = await execAsync(recentCmd, { cwd: backendDir });
    const recentResult = JSON.parse(recentStdout.trim());

    if (summaryResult.status === 'success' && recentResult.status === 'success') {
      return NextResponse.json({
        success: true,
        summary: summaryResult.data,
        recent: recentResult.data,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch analytics data from backend' },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('API GET /api/analytics error:', error);
    const errObj = error as { message?: string };
    return NextResponse.json(
      { success: false, error: errObj.message || 'Failed to fetch call analytics' },
      { status: 500 }
    );
  }
}
