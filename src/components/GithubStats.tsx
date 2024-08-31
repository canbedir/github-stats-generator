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

      if (response.ok && reposResponse.ok) {
        const userData = await response.json();
        const reposData = await reposResponse.json();

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

        const statsData = {
          username,
          repoCount: public_repos,
          followers,
          following,
          totalStars,
          totalForks,
          topLanguage,
          contributionScore,
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
<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
  <style>
    .small { font: bold 12px sans-serif; }
    .heavy { font: bold 16px sans-serif; }
  </style>
  <text x="10" y="20" class="heavy">${data.username}'in GitHub İstatistikleri</text>
  <text x="10" y="40" class="small">Repo Sayısı: ${data.repoCount}</text>
  <text x="10" y="60" class="small">Takipçi: ${data.followers}</text>
  <text x="10" y="80" class="small">Yıldız: ${data.totalStars}</text>
  <text x="10" y="100" class="small">Fork: ${data.totalForks}</text>
  <text x="10" y="120" class="small">En Çok Kullanılan Dil: ${data.topLanguage}</text>
  <text x="10" y="140" class="small">Katkı Puanı: ${data.contributionScore}</text>
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
