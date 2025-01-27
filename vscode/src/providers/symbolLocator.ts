import { CancellationToken, DocumentSymbol, TextDocument } from "vscode";
import * as vscode from "vscode";
import { BuiltInCommands } from "../constants";
import { Logger } from "../logger";
import { Container } from "../container";

const sleep = async (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export class InstrumentableSymbol {
	constructor(
		public symbol: vscode.DocumentSymbol,
		public parent: vscode.DocumentSymbol | undefined
	) {}
}

export interface ISymbolLocator {
	locate(document: TextDocument, token: vscode.CancellationToken): Promise<{
		instrumentableSymbols: InstrumentableSymbol[],
		allSymbols: DocumentSymbol[]
	}>;
}

export class SymbolLocator implements ISymbolLocator {
	async locate(
		document: TextDocument,
		token: vscode.CancellationToken
	): Promise<{
		instrumentableSymbols: InstrumentableSymbol[],
		allSymbols: DocumentSymbol[]
	}> {
		const instrumentableSymbols: InstrumentableSymbol[] = [];
		const emptyResult = {
			instrumentableSymbols: [],
			allSymbols: []
		}

		try {
			if (token.isCancellationRequested) {
				return emptyResult;
			}

			const symbolResult = await this.locateCore(document, token);
			this.buildLensCollection(undefined, symbolResult, instrumentableSymbols, token);
			return {
				instrumentableSymbols,
				allSymbols: symbolResult
			};
		} catch (ex) {
			Logger.warn("SymbolLocator.locate", {
				error: ex,
				document: document
			});
		}
		return emptyResult;
	}

	private async locateCore(
		document: TextDocument,
		token: vscode.CancellationToken
	): Promise<DocumentSymbol[]> {
		let symbols: DocumentSymbol[] | undefined = [];

		let localUri;
		if (document.uri.scheme === "codestream-diff") {
			const { uri: localUriString } = await Container.agent.urls.resolveLocalUri(
				document.uri.toString(true)
			);
			localUri = localUriString && vscode.Uri.parse(localUriString);
		}

		for (const timeout of [0, 750, 1000, 1500, 2000]) {
			if (token.isCancellationRequested) {
				Logger.log("SymbolLocator.locateCore isCancellationRequested", { timeout });
				return [];
			}
			try {
				symbols = await vscode.commands.executeCommand<DocumentSymbol[]>(
					BuiltInCommands.ExecuteDocumentSymbolProvider,
					localUri || document.uri
				);
				if (!symbols || symbols.length === 0) {
					await sleep(timeout);
				} else {
					const results = symbols || [];
					Logger.log(`SymbolLocator.locateCore found ${results.length}`, { timeout });
					return results;
				}
			} catch (ex) {
				Logger.warn("SymbolLocator.locateCore failed to ExecuteDocumentSymbolProvider", { ex });
			}
		}

		return symbols || [];
	}

	private buildLensCollection(
		parent: DocumentSymbol | undefined,
		symbols: DocumentSymbol[],
		collection: InstrumentableSymbol[],
		token: CancellationToken
	) {
		for (const symbol of symbols) {
			if (token.isCancellationRequested) {
				return;
			}

			if (symbol.children && symbol.children.length) {
				this.buildLensCollection(symbol, symbol.children, collection, token);
			}
			if (symbol.kind === vscode.SymbolKind.Function || symbol.kind === vscode.SymbolKind.Method) {
				collection.push(new InstrumentableSymbol(symbol, parent));
			}
		}
	}
}
