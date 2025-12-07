export interface Repo {
    id: number;
    name: string;
    html_url: string;
    description: string;
    stargazers_count: number;
    language: string;
    updated_at: string;
}

const DUMMY_REPOS: Repo[] = [
    {
        id: 1,
        name: "portfolio-nextjs",
        html_url: "https://github.com",
        description: "My personal portfolio built with Next.js and Tailwind.",
        stargazers_count: 120,
        language: "TypeScript",
        updated_at: "2024-03-10T00:00:00Z",
    },
    {
        id: 2,
        name: "react-component-lib",
        html_url: "https://github.com",
        description: "A comprehensive UI library for React applications.",
        stargazers_count: 85,
        language: "TypeScript",
        updated_at: "2024-02-15T00:00:00Z",
    },
    {
        id: 3,
        name: "audit-tool-cli",
        html_url: "https://github.com",
        description: "CLI tool for auditing website performance locally.",
        stargazers_count: 45,
        language: "JavaScript",
        updated_at: "2024-01-20T00:00:00Z",
    },
];

export async function fetchGitHubRepos(username: string): Promise<Repo[]> {
    try {
        const res = await fetch(
            `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`
        );

        if (!res.ok) {
            if (res.status === 403 || res.status === 404) {
                console.warn("GitHub API rate limit exceeded or user not found. Using dummy data.");
                return DUMMY_REPOS;
            }
            throw new Error("Failed to fetch repos");
        }

        const repos: Repo[] = await res.json();

        // Filter out forks if desired, here we just return them
        // Sort logic is handled by API param, but we can double check
        return repos.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    } catch (error) {
        console.error("Error fetching GitHub data:", error);
        return DUMMY_REPOS;
    }
}
