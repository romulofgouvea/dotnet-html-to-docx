import { Button } from "antd";
import React, { useState } from "react";
import RichTextEditor, { EditorValue, ToolbarConfig } from "react-rte";

import "./App.css";
import api, { BASE_URL } from "./services/api";

const defaultToolbarConfig = {
	// Conferir: https://github.com/sstur/react-rte/blob/master/src/lib/EditorToolbarConfig.js
	display: [
		"INLINE_STYLE_BUTTONS",
		"BLOCK_ALIGNMENT_BUTTONS",
		"BLOCK_TYPE_BUTTONS",
		"BLOCK_TYPE_DROPDOWN",
		"HISTORY_BUTTONS",
	],
	INLINE_STYLE_BUTTONS: [
		{ label: "Bold", style: "BOLD", className: "custom-css-class" },
		{ label: "Italic", style: "ITALIC" },
		{ label: "Underline", style: "UNDERLINE" },
	],
	BLOCK_TYPE_DROPDOWN: [
		{ label: "Normal", style: "unstyled" },
		{ label: "Heading Large", style: "header-one" },
		{ label: "Heading Medium", style: "header-two" },
		{ label: "Heading Small", style: "header-three" },
	],
	BLOCK_TYPE_BUTTONS: [
		{ label: "UL", style: "unordered-list-item" },
		{ label: "OL", style: "ordered-list-item" },
	],
	BLOCK_ALIGNMENT_BUTTONS: [
		{ label: "Align Left", style: "ALIGN_LEFT" },
		{ label: "Align Center", style: "ALIGN_CENTER" },
		{ label: "Align Right", style: "ALIGN_RIGHT" },
		{ label: "Align Justify", style: "ALIGN_JUSTIFY" },
	],
} as ToolbarConfig;

function App() {
	const [value, setValue] = useState<EditorValue>(
		RichTextEditor.createEmptyValue()
	);

	const enviarConteudoProBackend = async () => {
		console.log(value.toString("html"));
		const data = {
			filename: "geradoFrontend.docx",
			html: value.toString("html"),
		};

		await api.post(`${BASE_URL}/gerador`, data);
	};

	return (
		<div className="app">
			<div className="container">
				<RichTextEditor
					value={value}
					toolbarConfig={defaultToolbarConfig}
					onChange={(value: EditorValue) => {
						// pegar o valor: value.toString('html');
						setValue(value);
					}}
				/>

				<Button
					className="custon-button"
					type="primary"
					onClick={enviarConteudoProBackend}
				>
					Enviar Conteúdo
				</Button>
			</div>
		</div>
	);
}

export default App;
