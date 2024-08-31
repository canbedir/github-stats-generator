"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const GitHubStats = () => {
  const [username, setUsername] = useState("");
  const [stats, setStats] = useState<any>(null);

  const generateStats = async () => {
    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      const reposResponse = await fetch(
        `https://api.github.com/users/${username}/repos`
      );
      const eventsResponse = await fetch(
        `https://api.github.com/users/${username}/events?per_page=100`
      );

      if (response.ok && reposResponse.ok && eventsResponse.ok) {
        const userData = await response.json();
        const reposData = await reposResponse.json();
        const eventsData = await eventsResponse.json();

        const { public_repos, followers, following } = userData;
        const totalStars = reposData.reduce(
          (sum: number, repo: { stargazers_count: number }) =>
            sum + repo.stargazers_count,
          0
        );
        const totalForks = reposData.reduce(
          (sum: number, repo: { forks_count: number }) =>
            sum + repo.forks_count,
          0
        );
        const languages = reposData
          .map((repo: { language: string }) => repo.language)
          .filter(Boolean);
        const topLanguage =
          languages.length > 0
            ? languages
                .sort(
                  (a: string, b: string) =>
                    languages.filter((v: string) => v === a).length -
                    languages.filter((v: string) => v === b).length
                )
                .pop()
            : "Belirsiz";

        const contributionScore = totalStars * 2 + totalForks * 3 + followers;

        const lastYearCommits = eventsData.filter(
          (event: any) =>
            event.type === "PushEvent" &&
            new Date(event.created_at) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        ).length;

        const totalPRs = eventsData.filter(
          (event: any) => event.type === "PullRequestEvent"
        ).length;

        const totalIssues = eventsData.filter(
          (event: any) => event.type === "IssuesEvent"
        ).length;

        const statsData = {
          username,
          repoCount: public_repos,
          followers,
          following,
          totalStars,
          totalForks,
          topLanguage,
          contributionScore,
          lastYearCommits,
          totalPRs,
          totalIssues,
        };

        const statsUrl = `https://hixstats.vercel.app/api/stats?username=${username}`;
        setStats({ ...statsData, statsUrl });
      } else {
        setStats(null);
        alert("Kullanıcı bulunamadı veya bir hata oluştu.");
      }
    } catch (error) {
      setStats(null);
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const generateSVG = (data: any) => {
    return `
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&amp;display=swap');
    .card { font-family: 'Poppins', sans-serif; }
    .logo { font-size: 48px; font-weight: bold; fill: #e4e2e2; }
    .stats { font-size: 14px; fill: #ffffff; }
    .values { font-size: 14px; fill: #ffffff; text-anchor: end; }
  </style>
  <rect width="400" height="300" fill="#1c1c1c" rx="10" ry="10"/>
  <text x="200" y="60" class="logo card" text-anchor="middle">
    <tspan>H</tspan><tspan dx="10">I</tspan><tspan dx="10">X</tspan>
  </text>
  <g class="card">
    <text x="50" y="120" class="stats">Total Stars:</text>
    <text x="50" y="150" class="stats">Total Commits (Last Year):</text>
    <text x="50" y="180" class="stats">Total PRs:</text>
    <text x="50" y="210" class="stats">Total Issues:</text>
    <text x="50" y="240" class="stats">Toplam Repolar:</text>
    
    <text x="350" y="120" class="values">${data.totalStars}</text>
    <text x="350" y="150" class="values">${data.lastYearCommits}</text>
    <text x="350" y="180" class="values">${data.totalPRs}</text>
    <text x="350" y="210" class="values">${data.totalIssues}</text>
    <text x="350" y="240" class="values">${data.repoCount}</text>
  </g>
</svg>
    `;
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">GitHub Stats Generator</h1>
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter GitHub username"
          className="flex-grow border p-2 rounded"
        />
        <Button onClick={generateStats}>Generate Stats</Button>
      </div>
      {stats && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Generated Link:</h2>
          <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap overflow-x-auto">
            {`[![GitHub Stats](${stats.statsUrl})](https://github.com/${stats.username})`}
          </pre>
          <p className="mt-2">You can add this link to your GitHub profile.</p>
          <h2 className="text-xl font-bold mt-4 mb-2">Preview:</h2>
          <img src={stats.statsUrl} alt="GitHub Stats" className="w-full" />
        </div>
      )}
    </div>
  );
};

export default GitHubStats;
