import { Button } from "antd";
import React, { useState } from "react";
import RichTextEditor, { EditorValue, ToolbarConfig } from "react-rte";
import { EditorState, Modifier } from "draft-js";

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

	const html = `
		<!DOCTYPE HTML PUBLIC>
		<html>
			<head>
			<style>
				body{
					text-align: justify;
					font-family: 'Calibri';
					font-size: 12pt;
				}

				h1 {
					text-align: center;
				}
				
				p {
					text-indent:40px;
				}

				.title{
					text-align: center;
					font-size: 16pt;
				}

				table, th, td {
					border-color:black;
					border-style:solid;
					border-width:1px;
				}
			</style>
			</head>
			<body>
				<span class="title"><b>Lorem Ipsum</b></span>
				<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
				<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>

				<table width="50%" align="center" border="1">
					<tr>
						<td rowspan="2">Anime Studio</td>
						<td>Pixar</td>
					</tr>
					<tr>
						<td>Studio Ghibli</td>
					</tr>
				</table>

				<table width="100%" border="1">
					<tr style="font-weight: bold">
						<td>Studio</td>
						<td colspan="2">Animes</td>
					</tr>
					<tr>
						<td>Pixar</td>
						<td>The incredibles</td>
						<td>Ratatouille</td>
					</tr>
					<tr>
						<td>Studio Ghibli</td>
						<td>Grave of the Fireflies</td>
						<td>Spirited Away</td>
					</tr>
				</table>
	`;

	const enviarConteudoProBackend = async () => {
		const html2 = html + value.toString("html") + "</body></html>";

		const data = {
			filename: "geradoFrontend.docx",
			html: html2,
		};

		var result = await api.post(`${BASE_URL}/gerador`, data);
		console.log("result: ", result);
	};

	const enviarConteudoProBackendTemplate = async () => {
		const html2 = html + value.toString("html") + "</body></html>";

		const data = {
			filename: "geradoFrontendTemplate.docx",
			html: html2,
		};
		const result = await api.post(`${BASE_URL}/gerador/template`, data);
		console.log("result template: ", result);
	};

	const transformValueInVariable = (
		editorState: EditorState,
		type: string
	) => {
		let selection = editorState.getSelection();
		const anchorKey = selection.getAnchorKey();
		const currentContent = editorState.getCurrentContent();
		const currentBlock = currentContent.getBlockForKey(anchorKey);

		//Then based on the docs for SelectionState -
		const start = selection.getStartOffset();
		const end = selection.getEndOffset();
		const selectedText = currentBlock.getText().slice(start, end);

		var contentStateModified = Modifier.replaceText(
			value.getEditorState().getCurrentContent(),
			selection,
			`{[${type}${selectedText}]}`,
			editorState.getCurrentInlineStyle()
		);

		const editor = EditorState.createWithContent(contentStateModified);
		setValue(EditorValue.createFromState(editor));
	};

	const customControls = [
		(setValue: any, getValue: any, editorState: EditorState) => (
			<Button onClick={() => transformValueInVariable(editorState, "@")}>
				@
			</Button>
		),
		(setValue: any, getValue: any, editorState: EditorState) => (
			<Button onClick={() => transformValueInVariable(editorState, "!")}>
				!
			</Button>
		),
	];

	const getStringFromTextAreaRte = () => {
		var currentValue = value.getEditorState().getCurrentContent();
		var blocks = currentValue.getBlocksAsArray();

		var resultString = "";
		for (let block of blocks) {
			resultString += block.getText() + " ";
		}
		return resultString;
	};

	return (
		<div className="app">
			<div className="container">
				<RichTextEditor
					value={value}
					toolbarConfig={defaultToolbarConfig}
					{...{ customControls }}
					onChange={(value: EditorValue) => {
						// pegar o valor: value.toString('html');

						const result = getStringFromTextAreaRte();

						console.log(result);

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

				<Button
					className="custon-button"
					type="primary"
					onClick={enviarConteudoProBackendTemplate}
				>
					Enviar Conteúdo Template
				</Button>
			</div>
		</div>
	);
}

export default App;
