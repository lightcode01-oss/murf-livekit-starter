import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const scriptPath = path.resolve(process.cwd(), '../backend/src/escalation_api.py');
    const backendDir = path.resolve(process.cwd(), '../backend');

    const cmd = `uv run python "${scriptPath}" get --ref "${id}"`;
    const { stdout } = await execAsync(cmd, { cwd: backendDir });
    const result = JSON.parse(stdout.trim());

    if (result.status === 'success') {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json({ success: false, error: result.message }, { status: 404 });
    }
  } catch (error: any) {
    console.error('API GET /api/escalations/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch escalation' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['open', 'in_progress', 'resolved'].includes(status.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status provided. Must be open, in_progress, or resolved.',
        },
        { status: 400 }
      );
    }

    const scriptPath = path.resolve(process.cwd(), '../backend/src/escalation_api.py');
    const backendDir = path.resolve(process.cwd(), '../backend');

    const cmd = `uv run python "${scriptPath}" update --ref "${id}" --status "${status.toLowerCase()}"`;
    const { stdout } = await execAsync(cmd, { cwd: backendDir });
    const result = JSON.parse(stdout.trim());

    if (result.status === 'success') {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API PATCH /api/escalations/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update escalation status' },
      { status: 500 }
    );
  }
}
