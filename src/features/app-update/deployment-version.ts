export function formatDeploymentVersion(
  runNumber: string | undefined,
  shortSha: string | undefined,
): string {
  const run = runNumber?.trim()
  const sha = shortSha?.trim()

  if (!run || !sha) {
    return 'local'
  }

  return `${run}-${sha.slice(0, 7)}`
}

export function getCurrentDeploymentVersion(): string {
  return formatDeploymentVersion(
    import.meta.env.VITE_DEPLOYMENT_RUN_NUMBER,
    import.meta.env.VITE_DEPLOYMENT_SHORT_SHA,
  )
}
