
export async function getGithubPulseData() {
    const username = "Dharani-Sundharam";
    const startDate = new Date(2025, 5, 1); // June 1, 2025
    const endDate = new Date(); // Current date

    try {
        // Use official GitHub GraphQL API for accurate contribution data
        const query = `
            query {
                user(login: "${username}") {
                    contributionsCollection {
                        contributionCalendar {
                            totalContributions
                            weeks {
                                contributionDays {
                                    date
                                    contributionCount
                                }
                            }
                        }
                    }
                }
            }
        `;

        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN || ''}`,
            },
            body: JSON.stringify({ query }),
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            // Fallback to simpler REST API if GraphQL fails
            return await getGithubPulseDataFallback(username, startDate, endDate);
        }

        const result = await response.json();

        if (result.errors) {
            console.warn("GraphQL error, falling back to REST API:", result.errors);
            return await getGithubPulseDataFallback(username, startDate, endDate);
        }

        const weeks = result.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];
        const totalContributionsInRange = result.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions || 0;

        // Flatten weeks into days and filter by date range
        const contributions = weeks
            .flatMap((week: any) =>
                week.contributionDays.map((day: any) => ({
                    date: day.date,
                    count: day.contributionCount,
                    level: getLevel(day.contributionCount)
                }))
            )
            .filter((day: any) => {
                const dayDate = new Date(day.date);
                return dayDate >= startDate && dayDate <= endDate;
            });

        // Calculate streak
        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        let idx = contributions.length - 1;

        // Skip future days
        while (idx >= 0 && contributions[idx].date > today) idx--;

        // Count consecutive days with contributions
        while (idx >= 0 && contributions[idx].count > 0) {
            currentStreak++;
            idx--;
        }

        // Calculate total for this range
        const totalCommits = contributions.reduce((acc: number, curr: any) => acc + curr.count, 0);

        return {
            contributions,
            totalCommits,
            currentStreak
        };

    } catch (error) {
        console.error("Pulse Data Error:", error);
        return await getGithubPulseDataFallback("Dharani-Sundharam", startDate, endDate);
    }
}

// Fallback REST API method for when GraphQL is not available
async function getGithubPulseDataFallback(username: string, startDate: Date, endDate: Date) {
    try {
        // Fetch data for both 2025 and 2026
        const contributions2025 = await fetchYearContributions(username, 2025);
        const contributions2026 = await fetchYearContributions(username, 2026);
        const allContributions = [...contributions2025, ...contributions2026];

        // Filter by date range (June 2025 to current)
        const filteredContributions = allContributions.filter((day: any) => {
            const dayDate = new Date(day.date);
            return dayDate >= startDate && dayDate <= endDate;
        });

        const totalCommits = filteredContributions.reduce((acc: number, curr: any) => acc + curr.count, 0);

        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        let idx = filteredContributions.length - 1;

        while (idx >= 0 && filteredContributions[idx].date > today) idx--;
        while (idx >= 0 && filteredContributions[idx].count > 0) {
            currentStreak++;
            idx--;
        }

        return {
            contributions: filteredContributions,
            totalCommits,
            currentStreak
        };
    } catch (error) {
        console.error("Fallback API Error:", error);
        return { contributions: [], totalCommits: 0, currentStreak: 0 };
    }
}

// Helper to fetch contributions for a specific year
async function fetchYearContributions(username: string, year: number) {
    try {
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=${year}`, {
            next: { revalidate: 1800 }
        });

        if (!res.ok) return [];

        const data = await res.json();
        return data.contributions || [];
    } catch (error) {
        console.error(`Error fetching ${year} contributions:`, error);
        return [];
    }
}

// Helper to determine contribution level (0-4)
function getLevel(count: number): number {
    if (count === 0) return 0;
    if (count <= 5) return 1;
    if (count <= 10) return 2;
    if (count <= 20) return 3;
    return 4;
}
