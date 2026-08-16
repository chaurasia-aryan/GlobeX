import { describe, it, expect } from "vitest";
import { CANONICAL_CORE_FLOW_ITEMS } from "@/components/layout/CoreFlowSidebar";
import { TOP_BUYERS_DATA } from "@/data/mockTradeData";

describe("GLOBEX Iteration 4 - Information Architecture & Marketplace Demand Layer", () => {
  it("should define exactly 6 canonical core flow lifecycle steps", () => {
    expect(CANONICAL_CORE_FLOW_ITEMS).toHaveLength(6);
    expect(CANONICAL_CORE_FLOW_ITEMS.map((i) => i.label)).toEqual([
      "Command Center",
      "Trade Discovery",
      "Trade Requests",
      "Active Trades",
      "Documents",
      "Settlement",
    ]);
  });

  it("should match canonical routes for each lifecycle step", () => {
    expect(CANONICAL_CORE_FLOW_ITEMS[0].href).toBe("/dashboard");
    expect(CANONICAL_CORE_FLOW_ITEMS[1].href).toBe("/marketplace");
    expect(CANONICAL_CORE_FLOW_ITEMS[2].href).toBe("/trade-requests");
    expect(CANONICAL_CORE_FLOW_ITEMS[3].href).toBe("/trades/TRD-IND-UAE-550K");
    expect(CANONICAL_CORE_FLOW_ITEMS[4].href).toBe("/documents");
    expect(CANONICAL_CORE_FLOW_ITEMS[5].href).toBe("/escrow");
  });

  it("should expose Top 10 Verified Buyers data with authentic ranking signals", () => {
    expect(TOP_BUYERS_DATA).toHaveLength(10);
    expect(TOP_BUYERS_DATA[0].name).toBe("Example Global Trading Ltd.");
    expect(TOP_BUYERS_DATA[0].activeRFQs).toBe(18);
    expect(TOP_BUYERS_DATA[0].demandValueUSD).toBeGreaterThan(0);
    expect(TOP_BUYERS_DATA[0].rank).toBe("01");
  });

  it("should process user requirement query and return ML candidate count and ranked recommendations", async () => {
    const { aiService } = await import("@/services/api/aiService");
    const result = await aiService.matchBuyers({
      commodity: "1121 Steam Basmati Rice",
      quantity: 1000,
      unit: "MT",
      destinationCountry: "UAE",
    });

    expect(result.candidateCount).toBe(7420);
    expect(result.strongMatchCount).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThanOrEqual(5);
    expect(result.recommendations[0].matchScore).toBeGreaterThanOrEqual(90);
    expect(result.recommendations[0].matchSignals?.length).toBeGreaterThan(0);
  });
});
