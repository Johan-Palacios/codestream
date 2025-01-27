import { Logger } from "../../logger";
import { FunctionLocator } from "../../protocol/agent.protocol.providers";
import { escapeNrql } from "../newrelic";
import { ResolutionMethod } from "./newrelic.types";

export const spanQueryTypes = ["equals", "like", "fuzzy"] as const;
export type SpanQueryType = typeof spanQueryTypes[number];
const LIMIT = 250;

function functionLocatorQuery(
	newRelicEntityGuid: string,
	functionLocator: FunctionLocator,
	spanQueryType: SpanQueryType
): string {
	let query: string;
	if (spanQueryType === "equals") {
		const equalsQueryParts: string[] = [];
		if (functionLocator.namespaces) {
			const joinedNamespaces = functionLocator.namespaces.map(_ => `'${_}'`).join(",");
			equalsQueryParts.push(`code.namespace IN (${joinedNamespaces})`);
		}
		if (functionLocator.namespace) {
			equalsQueryParts.push(`code.namespace='${functionLocator.namespace}'`);
		}
		if (functionLocator.functionName) {
			equalsQueryParts.push(`code.function='${functionLocator.functionName}'`);
		}
		const innerQueryEqualsClause = equalsQueryParts.join(" AND ");
		query = `SELECT name,\`transaction.name\`,code.lineno,code.namespace,code.function,traceId,transactionId from Span WHERE \`entity.guid\` = '${newRelicEntityGuid}' AND ${innerQueryEqualsClause} SINCE 30 minutes AGO LIMIT ${LIMIT}`;
	} else {
		const likeQueryParts: string[] = [];
		if (functionLocator.namespaces) {
			const likes = functionLocator.namespaces.map(_ => `code.namespace LIKE '${_}%'`).join(" OR ");
			likeQueryParts.push(`(${likes})`);
		}
		if (functionLocator.namespace) {
			likeQueryParts.push(`code.namespace like '${functionLocator.namespace}%'`);
		}
		if (functionLocator.functionName) {
			likeQueryParts.push(`code.function like '${functionLocator.functionName}%'`);
		}
		const innerQueryLikeClause = likeQueryParts.join(" AND ");
		query = `SELECT name,\`transaction.name\`,code.lineno,code.namespace,code.function,traceId,transactionId from Span WHERE \`entity.guid\` = '${newRelicEntityGuid}' AND ${innerQueryLikeClause} SINCE 30 minutes AGO LIMIT ${LIMIT}`;
	}
	return `query GetSpans($accountId:Int!) {
			actor {
				account(id: $accountId) {
					nrql(query: "${escapeNrql(query)}") {
						results
					}
				}
			}
	  }`;
}

function hybridQuery(
	newRelicEntityGuid: string,
	codeFilePath: string,
	functionLocator: FunctionLocator | undefined,
	spanQueryType: SpanQueryType
) {
	let query: string;
	if (spanQueryType === "equals") {
		let searchClause;
		if (functionLocator) {
			const equalsQueryParts: string[] = [];
			if (functionLocator.namespaces) {
				const joinedNamespaces = functionLocator.namespaces.map(_ => `'${_}'`).join(",");
				equalsQueryParts.push(`code.namespace IN (${joinedNamespaces})`);
			}
			if (functionLocator.namespace) {
				equalsQueryParts.push(`code.namespace='${functionLocator.namespace}'`);
			}
			if (functionLocator.functionName) {
				equalsQueryParts.push(`code.function='${functionLocator.functionName}'`);
			}
			searchClause = equalsQueryParts.join(" AND ");
		} else {
			searchClause = `code.filepath='${codeFilePath}'`;
		}
		query = `SELECT name,\`transaction.name\`,code.lineno,code.namespace,code.function,traceId,transactionId from Span WHERE \`entity.guid\` = '${newRelicEntityGuid}' AND ${searchClause} SINCE 30 minutes AGO LIMIT ${LIMIT}`;
	} else {
		let searchClause;
		if (functionLocator) {
			const likeQueryParts: string[] = [];
			if (functionLocator.namespaces) {
				const likes = functionLocator.namespaces
					.map(_ => `code.namespace LIKE '${_}%'`)
					.join(" OR ");
				likeQueryParts.push(`(${likes})`);
			}
			if (functionLocator.namespace) {
				likeQueryParts.push(`code.namespace like '${functionLocator.namespace}%'`);
			}
			if (functionLocator.functionName) {
				likeQueryParts.push(`code.function like '${functionLocator.functionName}%'`);
			}
			searchClause = likeQueryParts.join(" AND ");
		} else {
			searchClause = `code.filepath='${codeFilePath}'`;
		}
		query = `SELECT name,\`transaction.name\`,code.lineno,code.namespace,code.function,traceId,transactionId from Span WHERE \`entity.guid\` = '${newRelicEntityGuid}' AND ${searchClause} SINCE 30 minutes AGO LIMIT ${LIMIT}`;
	}
	return `query GetSpans($accountId:Int!) {
			actor {
				account(id: $accountId) {
					nrql(query: "${escapeNrql(query)}") {
						results
					}
				}
			}
	  }`;
}

export function generateSpanQuery(
	newRelicEntityGuid: string,
	resolutionMethod: ResolutionMethod,
	spanQueryType: SpanQueryType,
	codeFilePath?: string,
	locator?: FunctionLocator
) {
	if (resolutionMethod === "locator" && !locator) {
		Logger.warn("generateSpanQuery missing locator");
		throw new Error("ERR_INVALID_ARGS");
	}
	if (resolutionMethod === "filePath" && !codeFilePath) {
		Logger.warn("generateSpanQuery missing filePAth");
		throw new Error("ERR_INVALID_ARGS");
	}

	if (resolutionMethod === "locator" || (resolutionMethod === "hybrid" && locator)) {
		return functionLocatorQuery(newRelicEntityGuid, locator!, spanQueryType);
	}

	codeFilePath = codeFilePath?.replace(/\\/g, "/");

	// if (resolutionMethod === "hybrid") {
	// 	return hybridQuery(newRelicEntityGuid, codeFilePath!, locator, spanQueryType);
	// }

	let query: string;

	switch (spanQueryType) {
		case "equals": {
			const equalsLookup = `code.filepath='${codeFilePath}'`;
			query = `SELECT name,\`transaction.name\`,code.lineno,code.namespace,code.function,traceId,transactionId from Span WHERE \`entity.guid\` = '${newRelicEntityGuid}' AND ${equalsLookup}  SINCE 30 minutes AGO LIMIT ${LIMIT}`;
			break;
		}
		case "like": {
			const likeLookup = `code.filepath like '%${codeFilePath}'`;
			query = `SELECT name,\`transaction.name\`,code.lineno,code.namespace,code.function,traceId,transactionId from Span WHERE \`entity.guid\` = '${newRelicEntityGuid}' AND ${likeLookup}  SINCE 30 minutes AGO LIMIT ${LIMIT}`;
			break;
		}
		case "fuzzy": {
			const fuzzyLookup = `code.filepath like '%/${codeFilePath!.split("/").slice(-2).join("/")}%'`;

			query = `SELECT name,\`transaction.name\`,code.lineno,code.namespace,code.function,traceId,transactionId from Span WHERE \`entity.guid\` = '${newRelicEntityGuid}' AND ${fuzzyLookup}  SINCE 30 minutes AGO LIMIT ${LIMIT}`;
		}
	}

	return `query GetSpans($accountId:Int!) {
			actor {
				account(id: $accountId) {
					nrql(query: "${query}") {
						results
					}
				}
			}
	  }`;
}

export function generateClmSpanDataExistsQuery(newRelicEntityGuid: string) {
	const query = `query GetSpans($accountId:Int!) {
			actor {
				account(id: $accountId) {
					nrql(query: "SELECT name,code.function,\`entity.guid\` from Span WHERE \`entity.guid\` = '${newRelicEntityGuid}' AND code.function is not NULL SINCE 30 minutes AGO LIMIT 1") {
						results
					}				 
				}
			}
	  }`;
	return query;
}
