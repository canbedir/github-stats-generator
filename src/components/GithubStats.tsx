"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GithubIcon } from "lucide-react";

const GitHubStats = () => {
  const [username, setUsername] = useState("");
  const [stats, setStats] = useState<any>(null);

  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stats && svgRef.current) {
      const letters = svgRef.current.querySelectorAll('.hix-letter');
      const statElements = svgRef.current.querySelectorAll('.stats, .values');

      letters.forEach((letter, index) => {
        setTimeout(() => {
          (letter as HTMLElement).style.opacity = '1';
          (letter as HTMLElement).style.transition = 'opacity 0.5s ease';
        }, index * 500);
      });

      setTimeout(() => {
        statElements.forEach((element, index) => {
          setTimeout(() => {
            (element as HTMLElement).style.opacity = '1';
            (element as HTMLElement).style.transition = 'opacity 0.5s ease';
          }, index * 100);
        });
      }, letters.length * 500 );
    }
  }, [stats]);

  const generateStats = async () => {
    try {
      const headers = {
        Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
      };
      const response = await fetch(`https://api.github.com/users/${username}`, { headers });
      const reposResponse = await fetch(`https://api.github.com/users/${username}/repos`, { headers });
      const eventsResponse = await fetch(`https://api.github.com/users/${username}/events?per_page=100`, { headers });

      if (response.ok && reposResponse.ok && eventsResponse.ok) {
        const userData = await response.json();
        const reposData = await reposResponse.json();
        const eventsData = await eventsResponse.json();

        const { public_repos, followers, following } = userData;
        const totalStars = reposData.reduce((sum: number, repo: { stargazers_count: number }) => sum + repo.stargazers_count, 0);
        const totalForks = reposData.reduce((sum: number, repo: { forks_count: number }) => sum + repo.forks_count, 0);
        const languages = reposData.map((repo: { language: string }) => repo.language).filter(Boolean);
        const topLanguage = languages.length > 0 ? 
          languages.sort((a: string, b: string) => 
            languages.filter((v: string) => v === a).length - languages.filter((v: string) => v === b).length
          ).pop() : 'Belirsiz';

        const contributionScore = totalStars * 2 + totalForks * 3 + followers;

        const lastYearCommits = eventsData.filter((event: any) => 
          event.type === "PushEvent" &&
          new Date(event.created_at) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        ).length;

        const totalPRs = eventsData.filter((event: any) => event.type === "PullRequestEvent").length;

        const totalIssues = eventsData.filter((event: any) => event.type === "IssuesEvent").length;

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

        const statsUrl = `https://hixstats.vercel.app/api/stats?username=${username}&totalStars=${totalStars}&lastYearCommits=${lastYearCommits}&totalPRs=${totalPRs}&totalIssues=${totalIssues}&repoCount=${public_repos}`;
        const svgResponse = await fetch(statsUrl);
        const svg = await svgResponse.text();
        setStats({ ...statsData, statsUrl, svg });
      } else {
        setStats(null);
        alert("Kullanıcı bulunamadı veya bir hata oluştu.");
      }
    } catch (error) {
      setStats(null);
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-8 rounded-lg shadow-md max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">GitHub Stats Generator</h1>
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
            <div className="w-full max-w-[300px] mx-auto" dangerouslySetInnerHTML={{ __html: stats.svg }} ref={svgRef} />
          </div>
        )}
      </div>
      <Link className="absolute bottom-3 right-3" href={"https://github.com/canbedir"} target="_blank">
      <GithubIcon className="w-12 h-12" />
      </Link>
    </div>
  );
};

export default GitHubStats;
