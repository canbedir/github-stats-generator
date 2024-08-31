import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Valid username is required' }, { status: 400 });
  }

  try {
    const userResponse = await fetch(`https://api.github.com/users/${username}`);
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos`);

    if (!userResponse.ok || !reposResponse.ok) {
      throw new Error('Failed to fetch data from GitHub API');
    }

    const userData = await userResponse.json();
    const reposData = await reposResponse.json();

    const { public_repos, followers, following } = userData;
    const totalStars = reposData.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0);
    const totalForks = reposData.reduce((sum: number, repo: any) => sum + repo.forks_count, 0);
    const languages = reposData.map((repo: any) => repo.language).filter(Boolean);
    const topLanguage = languages.length > 0 ? 
      languages.sort((a: string, b: string) => 
        languages.filter((v: string) => v === a).length - languages.filter((v: string) => v === b).length
      ).pop() : 'Unknown';

    const contributionScore = totalStars * 2 + totalForks * 3 + followers;

    const svg = `
      <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
        <style>
          .stats { font: 14px Arial, sans-serif; fill: #333; }
          .title { font: bold 18px Arial, sans-serif; fill: #0366d6; }
        </style>
        <rect width="400" height="200" fill="#f6f8fa"/>
        <text x="10" y="30" class="title">${username}'s GitHub Stats</text>
        <text x="10" y="60" class="stats">Repos: ${public_repos}</text>
        <text x="10" y="85" class="stats">Followers: ${followers}</text>
        <text x="10" y="110" class="stats">Stars: ${totalStars}</text>
        <text x="10" y="135" class="stats">Forks: ${totalForks}</text>
        <text x="10" y="160" class="stats">Top Language: ${topLanguage}</text>
        <text x="10" y="185" class="stats">Contribution Score: ${contributionScore}</text>
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
