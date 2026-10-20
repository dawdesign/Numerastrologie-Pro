export interface WikiSearchResult {
    title: string;
    pageid: number;
    snippet: string;
}

export async function fetchWikiSearch(query: string, language: 'en' | 'fr' = 'en'): Promise<WikiSearchResult[]> {
    const url = `https://${language}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    return data.query?.search || [];
}

export type WikiEntityDetails = {
    foundDate: { year: number, month: number, day: number } | null;
    foundEndDate: { year: number, month: number, day: number } | null;
};

const monthMap: Record<string, number> = {
    'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
    'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12,
    'janvier': 1, 'février': 2, 'fevrier': 2, 'mars': 3, 'avril': 4, 'mai': 5, 'juin': 6,
    'juillet': 7, 'août': 8, 'aout': 8, 'septembre': 9, 'octobre': 10, 'novembre': 11, 'décembre': 12, 'decembre': 12
};

export async function fetchWikiEntityDetails(title: string, language: 'en' | 'fr' = 'en'): Promise<WikiEntityDetails> {
    let foundDate: { year: number, month: number, day: number } | null = null;
    let foundEndDate: { year: number, month: number, day: number } | null = null;

    const wdUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&sites=${language}wiki&titles=${encodeURIComponent(title)}&props=claims&format=json&origin=*`;
    const wdRes = await fetch(wdUrl);
    const wdData = await wdRes.json();

    if (wdData.entities) {
        const entityId = Object.keys(wdData.entities)[0];
        if (entityId !== '-1') {
            const claims = wdData.entities[entityId].claims;
            if (claims) {
                // Try finding Start Date / Birth Date
                const propertiesToTry = ['P569', 'P571', 'P1619', 'P580', 'P585', 'P577'];
                let targetClaimsList = null;
                for (const prop of propertiesToTry) {
                    if (claims[prop] && claims[prop].length > 0) {
                        targetClaimsList = claims[prop];
                        break;
                    }
                }

                if (targetClaimsList) {
                    const bestClaim = targetClaimsList.find((c: any) => c.rank === 'preferred') || targetClaimsList[0];
                    const snak = bestClaim.mainsnak;
                    if (snak.snaktype === 'value' && snak.datavalue?.type === 'time') {
                        const timeStr = snak.datavalue.value.time;
                        const match = timeStr.match(/^[+-]0*(\d+)-(\d{2})-(\d{2})/);
                        if (match) {
                            const y = parseInt(match[1], 10);
                            let m = parseInt(match[2], 10);
                            let d = parseInt(match[3], 10);
                            if (m === 0) m = 1;
                            if (d === 0) d = 1;
                            if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
                                foundDate = { year: timeStr.startsWith('-') ? -y : y, month: m, day: d };
                            }
                        }
                    }
                }

                // Try finding End Date (Death, Dissolution, etc)
                const endPropertiesToTry = ['P570', 'P576', 'P582', 'P3999'];
                let endTargetClaimsList = null;
                for (const prop of endPropertiesToTry) {
                    if (claims[prop] && claims[prop].length > 0) {
                        endTargetClaimsList = claims[prop];
                        break;
                    }
                }

                if (endTargetClaimsList) {
                    const bestEndClaim = endTargetClaimsList.find((c: any) => c.rank === 'preferred') || endTargetClaimsList[0];
                    const snak = bestEndClaim.mainsnak;
                    if (snak.snaktype === 'value' && snak.datavalue?.type === 'time') {
                        const timeStr = snak.datavalue.value.time;
                        const match = timeStr.match(/^[+-]0*(\d+)-(\d{2})-(\d{2})/);
                        if (match) {
                            const y = parseInt(match[1], 10);
                            let m = parseInt(match[2], 10);
                            let d = parseInt(match[3], 10);
                            if (m === 0) m = 1;
                            if (d === 0) d = 1;
                            if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
                                foundEndDate = { year: timeStr.startsWith('-') ? -y : y, month: m, day: d };
                            }
                        }
                    }
                }
            }
        }
    }

    if (!foundDate) {
        const url = `https://${language}.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvsection=0&titles=${encodeURIComponent(title)}&format=json&origin=*`;
        const res = await fetch(url);
        const data = await res.json();
        const pages = data.query?.pages;
        if (pages) {
            const pageId = Object.keys(pages)[0];
            const content = pages[pageId].revisions?.[0]?.['*'] || '';

            // English regex templates
            const pDatesRegex = /\{\{\s*(?:[Bb]irth date(?: and age)?|[Bb]da|[Ee]nd date(?: and age)?|[Ss]tart date(?: and age)?)\s*\|(.*?)}}/i;
            const match = content.match(pDatesRegex);

            // French regex templates
            const pDatesFrRegex = /\{\{\s*(?:[Dd]ate de naissance|[Dd]ate de fondation|[Dd]ate de cr[eé]ation|[Dd]ate de d[eé]c[eè]s|[Nn]aissance)\s*\|(.*?)}}/i;
            const matchFr = content.match(pDatesFrRegex);

            if (match) {
                const parts = match[1].split('|').filter((p: string) => /^\d+$/.test(p.trim()));
                if (parts.length >= 3) {
                    foundDate = {
                        year: parseInt(parts[0], 10),
                        month: parseInt(parts[1], 10),
                        day: parseInt(parts[2], 10)
                    };
                } else if (parts.length === 2) {
                    foundDate = {
                        year: parseInt(parts[0], 10),
                        month: parseInt(parts[1], 10),
                        day: 1
                    };
                } else if (parts.length === 1) {
                    foundDate = {
                        year: parseInt(parts[0], 10),
                        month: 1,
                        day: 1
                    };
                }
            } else if (matchFr) {
                const rawParts = matchFr[1].split('|').map((p: string) => p.trim());
                // Handle templates like {{Date de naissance|22|octobre|2000}} or {{Date de naissance|22|10|2000}}
                const numericParts = rawParts.filter((p: string) => /^\d+$/.test(p));
                const textMonthPart = rawParts.find((p: string) => monthMap[p.toLowerCase()] !== undefined);

                if (textMonthPart) {
                    const mVal = monthMap[textMonthPart.toLowerCase()];
                    // We need a year (4 digits) and a day (1 or 2 digits)
                    const yearPart = numericParts.find((p: string) => p.length === 4);
                    const dayPart = numericParts.find((p: string) => p.length <= 2 && p !== yearPart);

                    if (yearPart && dayPart) {
                        foundDate = {
                            year: parseInt(yearPart, 10),
                            month: mVal,
                            day: parseInt(dayPart, 10)
                        };
                    } else if (yearPart) {
                        foundDate = {
                            year: parseInt(yearPart, 10),
                            month: mVal,
                            day: 1
                        };
                    }
                } else if (numericParts.length >= 3) {
                    // E.g. 2000|10|22 or 22|10|2000
                    if (numericParts[0].length === 4) {
                        foundDate = {
                            year: parseInt(numericParts[0], 10),
                            month: parseInt(numericParts[1], 10),
                            day: parseInt(numericParts[2], 10)
                        };
                    } else if (numericParts[2].length === 4) {
                        foundDate = {
                            year: parseInt(numericParts[2], 10),
                            month: parseInt(numericParts[1], 10),
                            day: parseInt(numericParts[0], 10)
                        };
                    }
                }
            } else {
                const fallbackRegex = /\|\s*(?:First game|First match|Founded|Formation|Fondation|Date de fondation|Date de création)\s*=.*?(?:(\d{1,2})\s+([a-zA-Zéûûôàç]+)\s+(\d{4})|([a-zA-Zéûûôàç]+)\s+(\d{1,2}),?\s+(\d{4}))/i;
                const fallbackMatch = content.match(fallbackRegex);
                
                if (fallbackMatch) {
                    if (fallbackMatch[1] && monthMap[fallbackMatch[2].toLowerCase()]) {
                        foundDate = {
                            year: parseInt(fallbackMatch[3], 10),
                            month: monthMap[fallbackMatch[2].toLowerCase()],
                            day: parseInt(fallbackMatch[1], 10)
                        };
                    } else if (fallbackMatch[4] && monthMap[fallbackMatch[4].toLowerCase()]) {
                        foundDate = {
                            year: parseInt(fallbackMatch[6], 10),
                            month: monthMap[fallbackMatch[4].toLowerCase()],
                            day: parseInt(fallbackMatch[5], 10)
                        };
                    }
                }
            }
        }
    }

    return { foundDate, foundEndDate };
}
