export async function POST() {
  return Response.json({
    success: true,
    results: {
      newProblems: 3,
      updated: 8,
      removed: 1,
      scanDurationMs: 4800,
      sourcesChecked: 23,
      claimsProcessed: 142,
      lastScanAt: new Date().toISOString(),
    },
  })
}
