import budgetData from "@/data/seoul-budget.json";
import transportData from "@/data/seoul-transportation.json";
import populationData from "@/data/seoul-population.json";
import housingData from "@/data/seoul-housing.json";
import safetyData from "@/data/seoul-safety.json";
import environmentData from "@/data/seoul-environment.json";

const dataMap: Record<string, object> = {
  "seoul-budget": budgetData,
  "seoul-transportation": transportData,
  "seoul-population": populationData,
  "seoul-housing": housingData,
  "seoul-safety": safetyData,
  "seoul-environment": environmentData,
};

export function getSeoulDataForTopic(dataKeys: string[]): string {
  return dataKeys
    .map((key) => {
      const data = dataMap[key];
      if (!data) return "";
      return JSON.stringify(data, null, 2);
    })
    .filter(Boolean)
    .join("\n\n");
}

export function getAllSeoulData(): string {
  return Object.values(dataMap)
    .map((d) => JSON.stringify(d, null, 2))
    .join("\n\n");
}
