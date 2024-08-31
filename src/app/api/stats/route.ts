import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username');
  const totalStars = req.nextUrl.searchParams.get('totalStars');
  const lastYearCommits = req.nextUrl.searchParams.get('lastYearCommits');
  const totalPRs = req.nextUrl.searchParams.get('totalPRs');
  const totalIssues = req.nextUrl.searchParams.get('totalIssues');
  const repoCount = req.nextUrl.searchParams.get('repoCount');

  if (!username) {
    return NextResponse.json({ error: 'Valid username is required' }, { status: 400 });
  }

  try {
    const svg = `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&amp;display=swap');
        .card { font-family: 'Inter', sans-serif; }
        .title { font-size: 24px; font-weight: bold; fill: #ffffff; }
        .stats { font-size: 14px; fill: #ffffff; opacity: 0.8; }
        .values { font-size: 14px; fill: #ffffff; text-anchor: end; }
      </style>
      <rect width="300" height="200" fill="#1c1c1c" rx="10" ry="10"/>
      <text x="150" y="40" class="title card" text-anchor="middle">HIX</text>
      <g class="card">
        <text x="20" y="80" class="stats">Total Stars:</text>
        <text x="20" y="105" class="stats">Total Commits (Last Year):</text>
        <text x="20" y="130" class="stats">Total PRs:</text>
        <text x="20" y="155" class="stats">Total Issues:</text>
        <text x="20" y="180" class="stats">Total Repos:</text>
        
        <text x="280" y="80" class="values">${totalStars}</text>
        <text x="280" y="105" class="values">${lastYearCommits}</text>
        <text x="280" y="130" class="values">${totalPRs}</text>
        <text x="280" y="155" class="values">${totalIssues}</text>
        <text x="280" y="180" class="values">${repoCount}</text>
      </g>
    </svg>
    `;

    return new NextResponse(svg, {
      headers: { 'Content-Type': 'image/svg+xml' },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An error occurred while generating statistics' }, { status: 500 });
  }
}
