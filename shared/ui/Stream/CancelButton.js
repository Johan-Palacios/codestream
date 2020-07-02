import React from "react";
import Button from "./Button";
import Icon from "./Icon";
import Tooltip from "./Tooltip";
import KeystrokeDispatcher from "../utilities/keystroke-dispatcher";
import { useDidMount } from "../utilities/hooks";
import { logWarning } from "../logger";

CancelButton.defaultProps = {
	className: "",
	disabled: false,
	placement: "bottomRight"
};

export default function CancelButton({
	placement = "bottomRight",
	onClick,
	className = "cancel-icon",
	title = "",
	mode = "icon", // or "button"
	tooltip = undefined,
	...extras
}) {
	const { dispatch, ...extraProps } = extras; // remove non-html attributes

	useDidMount(() => {
		let disposable;
		if (onClick && typeof onClick === "function") {
			disposable = KeystrokeDispatcher.onKeyDown(
				"Escape",
				event => {
					// don't allow cancel if the MessageInput div is the target, unless it's empty
					const d = document.getElementById("input-div");
					if (event.target === d && d.innerHTML != "") {
						return;
					}

					onClick(event);
				},
				{ source: "CancelButton.js", level: -1 }
			);
		} else {
			logWarning("CancelButton missing onClick handler");
		}

		return () => disposable && disposable.dispose();
	});

	let tip = tooltip || (
		<span>
			{title || "Cancel"} <span className="keybinding">ESC</span>
		</span>
	);

	if (mode === "button") {
		return (
			<Tooltip title={tip} placement="bottom" delay={1}>
				<Button
					key="cancel"
					style={{
						paddingLeft: "10px",
						paddingRight: "10px",
						width: "auto"
					}}
					className="control-button cancel"
					type="submit"
					onClick={onClick}
				>
					{title || "Cancel"}
				</Button>
			</Tooltip>
		);
	} else {
		return (
			<span className="align-right-button cancel-button" onClick={onClick}>
				<Tooltip title={tip} placement={placement}>
					<span>
						<Icon name="x" className={className} />
					</span>
				</Tooltip>
			</span>
		);
	}
}
