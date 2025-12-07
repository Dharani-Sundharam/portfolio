import { GithubTimelineView } from "./github-timeline-view";

const GITHUB_USERNAME = "Dharani-Sundharam";

async function getLatestActivity() {
    try {
        // 1. Fetch public events
        const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events`, {
            next: { revalidate: 60 } // Cache for 60 seconds
        });

        if (!res.ok) {
            throw new Error("Failed to fetch GitHub events");
        }

        const events = await res.json();

        // 2. Filter for "PushEvent" only
        const pushEvents = events.filter((e: any) => e.type === 'PushEvent');

        // 3. Map to clean format
        return pushEvents.map((e: any) => {
            // Safety check for commits array
            const commits = e.payload?.commits;
            const firstCommit = commits && commits.length > 0 ? commits[0] : null;

            return {
                id: e.id,
                repo: e.repo.name,
                message: firstCommit?.message || "No message",
                date: new Date(e.created_at).toLocaleDateString(),
                timeAgo: getTimeAgo(new Date(e.created_at)),
                url: firstCommit
                    ? `https://github.com/${e.repo.name}/commit/${firstCommit.sha}`
                    : `https://github.com/${e.repo.name}`
            };
        }).slice(0, 6); // Get top 6 (1 hero + 5 timeline)

    } catch (error) {
        console.error("Error fetching GitHub activity:", error);
        return [];
    }
}

function getTimeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";

    return Math.floor(seconds) + " seconds ago";
}

export async function GithubTimeline() {
    const activity = await getLatestActivity();
    return <GithubTimelineView items={activity} />;
}
