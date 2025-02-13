import { authenticate } from "@codestream/webview/Authentication/actions";
import { Middleware } from "redux";
import { AppDispatch, CodeStreamState } from "..";
import { setMaintenanceMode } from "./actions";
import { SessionActionType } from "./types";

export const sessionMiddleware: Middleware =
	({ dispatch, getState }: { dispatch: AppDispatch; getState: () => CodeStreamState }) =>
	next => {
		let pollingTask: Poller | undefined;

		return action => {
			const result = next(action);

			if (action.type === SessionActionType.SetMaintenanceMode) {
				const { payload: enteringMaintenanceMode, meta }: ReturnType<typeof setMaintenanceMode> =
					action;
				if (enteringMaintenanceMode && pollingTask == undefined) {
					pollingTask = new Poller(10000, async () => {
						if (getState().session.inMaintenanceMode) {
							try {
								await dispatch(authenticate(meta as any));
								return !getState().session.inMaintenanceMode;
							} catch (error) {
								return;
							}
						} else {
							return true;
						}
					});

					pollingTask.start();
					pollingTask.onDidStop(() => (pollingTask = undefined));
				}
			}

			return result;
		};
	};

/*
	The executor will be invoked repeatedly according to the schedule until it returns `true` or
	a promise resolving as `true`
*/
type PollExecutor = () => boolean | void | Promise<boolean | void>;

class Poller {
	private _timerId?: number;
	private _listeners: (() => void)[] = [];
	get isRunning() {
		return this._timerId != undefined;
	}

	constructor(private readonly _time: number, private readonly _executor: PollExecutor) {}

	onDidStop(cb: () => void) {
		this._listeners.push(cb);
	}

	start() {
		if (!this.isRunning) this.schedule();
	}

	private schedule() {
		this._timerId = setTimeout(async () => {
			let result;

			try {
				result = await this._executor();
			} catch (error) {
				// TODO: onWillThrowError() or something to give clients a chance to handle it, otherwise throw the error
				throw error;
			}

			if (result === true) {
				this.stop();
			} else {
				this.schedule();
			}
		}, this._time) as unknown as number;
	}

	stop() {
		if (this._timerId != undefined) {
			clearTimeout(this._timerId);
			this._timerId = undefined;
			this._listeners.forEach(cb => {
				try {
					cb();
				} catch (error) {}
			});
		}
	}
}
