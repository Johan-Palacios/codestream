import { escapeNrql, LanguageId } from "../newrelic";

export function generateMethodErrorRateQuery(
	languageId: LanguageId,
	newRelicEntityGuid: string,
	metricTimesliceNames?: string[],
	codeNamespace?: string
) {
	const extrapolationsLookup = metricTimesliceNames?.length
		? `name in (${metricTimesliceNames.map(metric => `'${metric}'`).join(",")})`
		: `name LIKE '${codeNamespace}%'`;
	const extrapolationsQuery = `FROM Span SELECT rate(count(*), 1 minute) AS 'errorsPerMinute' WHERE \`entity.guid\` = '${newRelicEntityGuid}' AND \`error.group.guid\` IS NOT NULL AND ${extrapolationsLookup} FACET name AS metricTimesliceName SINCE 30 minutes AGO LIMIT 100 EXTRAPOLATE`;
	const metricsLookup = metricTimesliceNames?.length
		? `metricTimesliceName in (${metricTimesliceNames
				.map(z => `'Errors/WebTransaction/${z}'`)
				.join(",")})`
		: `metricTimesliceName LIKE '${codeNamespace}%'`;
	const metricsQuery = `SELECT rate(count(apm.service.transaction.error.count), 1 minute) AS \`errorsPerMinute\` FROM Metric WHERE \`entity.guid\` = '${newRelicEntityGuid}' AND ${metricsLookup} FACET metricTimesliceName SINCE 30 minutes AGO LIMIT 100`;

	return `query GetMethodErrorRate($accountId:Int!) {
			actor {
				account(id: $accountId) {
					metrics: nrql(query: "${escapeNrql(metricsQuery)}") {
						results
						metadata {
							timeWindow {
								begin
								end
							}
						}
					}
					extrapolations: nrql(query: "${escapeNrql(extrapolationsQuery)}") {
						results
						metadata {
							timeWindow {
								begin
								end
							}
						}
					}
				}
			}
	  }`;
}
