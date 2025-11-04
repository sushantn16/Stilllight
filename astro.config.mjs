// @ts-check
import { defineConfig } from 'astro/config';

const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isGithubPages = process.env.GITHUB_ACTIONS === "true" && repo && !repo.endsWith(".github.io");
const base = isGithubPages ? `/${repo}/` : "/";

// https://astro.build/config
export default defineConfig({
    output: "static",
    base,
});
