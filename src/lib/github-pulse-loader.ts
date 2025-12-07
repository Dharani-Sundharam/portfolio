
export async function getGithubPulseData() {
    const username = "Dharani-Sundharam";
    const currentYear = new Date().getFullYear();

    try {
        // Fetch data for the current year only
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=${currentYear}`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!res.ok) throw new Error("Failed to fetch graph");

        const data = await res.json();

        // We need to calculate some stats manually for the "Rolling Counters"
        const contributions = data.contributions || [];
        const totalCommits = contributions.reduce((acc: number, curr: any) => acc + curr.count, 0);

        // Simple logic to find current streak (working backwards from today)
        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        // Find index of today or yesterday
        let idx = contributions.length - 1;

        // Skip future days if any
        while (idx >= 0 && contributions[idx].date > today) idx--;

        // Count streak
        while (idx >= 0 && contributions[idx].count > 0) {
            currentStreak++;
            idx--;
        }

        return {
            contributions: contributions, // Return all days for this year
            totalCommits,
            currentStreak
        };

    } catch (error) {
        console.error("Pulse Data Error:", error);
        // Fallback if API fails
        return { contributions: [], totalCommits: 0, currentStreak: 0 };
    }
}
